import "server-only";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { product_trending_scores } from "../schema";
import { trending_period_key } from "../engines/trending.engine";
import { and, eq } from "drizzle-orm";
import { redisKeys } from "@/lib/redis/keys";
import { format, subDays } from "date-fns";
import { tryFn } from "@/lib/error_handling";

export class TrendingIndexService {
  async persist_trending_scores(period: "day" | "week" = "day") {
    const period_key = trending_period_key(period);
    const zkey = `rec:trending:z:${period}:${period_key}`;

    const [err, raw_items] = await tryFn(redis.zrevrange(zkey, 0, -1, "WITHSCORES"));
    if (err || !raw_items?.length) return;

    const candidates: Array<{ product_id: string; score: number }> = [];
    for (let i = 0; i < raw_items.length; i += 2) {
      candidates.push({
        product_id: raw_items[i],
        score: Number(raw_items[i + 1]),
      });
    }

    candidates.sort((a, b) => b.score - a.score);

    for (let idx = 0; idx < candidates.length; idx++) {
      const candidate = candidates[idx];
      const rank = idx + 1;

      const view_key = redisKeys.analytics.productViews(candidate.product_id);
      const [view_err, view_count_raw] = await tryFn(redis.get(view_key));
      const [order_err, order_count_raw] = await tryFn(redis.get(`${view_key}:orders`));
      const view_count = Number((!view_err ? view_count_raw : 0) ?? 0);
      const order_count = Number((!order_err ? order_count_raw : 0) ?? 0);

      const [existing_err, existing] = await tryFn(
        db
          .select()
          .from(product_trending_scores)
          .where(
            and(
              eq(product_trending_scores.product_id, candidate.product_id),
              eq(product_trending_scores.period, period),
              eq(product_trending_scores.period_key, period_key),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null),
      );
      void existing_err;

      if (existing) {
        const [upd_err] = await tryFn(
          db
            .update(product_trending_scores)
            .set({
              view_count,
              order_count,
              score: String(candidate.score),
              rank,
              updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            })
            .where(eq(product_trending_scores.id, existing.id)),
        );
        void upd_err;
      } else {
        const [ins_err] = await tryFn(
          db.insert(product_trending_scores).values({
            id: generate_id(),
            product_id: candidate.product_id,
            period,
            period_key,
            view_count,
            order_count,
            score: String(candidate.score),
            rank,
          }),
        );
        void ins_err;
      }
    }

    const old_period_key = format(subDays(new Date(), 14), "yyyy-MM-dd");
    const [del_err] = await tryFn(redis.del(`rec:trending:z:${period}:${old_period_key}`));
    void del_err;
  }

  async persist_from_redis() {
    await this.persist_trending_scores("day");
    await this.persist_trending_scores("week");
  }
}

export const trending_index_service = new TrendingIndexService();
