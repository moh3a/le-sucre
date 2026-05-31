import "server-only";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { product_trending_scores } from "../schema";
import { trending_period_key } from "../engines/trending.engine";
import { and, eq } from "drizzle-orm";
import { redisKeys } from "@/lib/redis/keys";

export class TrendingIndexService {
  async persist_trending_scores(period: "day" | "week" = "day") {
    const period_key = trending_period_key(period);
    const zkey = `rec:trending:z:${period}:${period_key}`;

    // Fetch members with scores from Redis
    const items = await redis.zrevrange(zkey, 0, -1, "WITHSCORES");
    if (!items.length) return;

    // Parse items into product_id and score pairs
    const candidates: Array<{ product_id: string; score: number }> = [];
    for (let i = 0; i < items.length; i += 2) {
      candidates.push({
        product_id: items[i],
        score: Number(items[i + 1]),
      });
    }

    // Rank desc
    candidates.sort((a, b) => b.score - a.score);

    for (let idx = 0; idx < candidates.length; idx++) {
      const candidate = candidates[idx];
      const rank = idx + 1;

      // Read view/order signals from Redis
      const view_key = redisKeys.analytics.productViews(candidate.product_id);
      const view_count = Number((await redis.get(view_key)) ?? 0);
      const order_count = Number((await redis.get(`${view_key}:orders`)) ?? 0);

      // Check if existing
      const [existing] = await db
        .select()
        .from(product_trending_scores)
        .where(
          and(
            eq(product_trending_scores.product_id, candidate.product_id),
            eq(product_trending_scores.period, period),
            eq(product_trending_scores.period_key, period_key),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(product_trending_scores)
          .set({
            view_count,
            order_count,
            score: String(candidate.score),
            rank,
            updated_at: new Date().toISOString(),
          })
          .where(eq(product_trending_scores.id, existing.id));
      } else {
        await db.insert(product_trending_scores).values({
          id: generate_id(),
          product_id: candidate.product_id,
          period,
          period_key,
          view_count,
          order_count,
          score: String(candidate.score),
          rank,
        });
      }
    }

    // Del keys older than 14 days
    const old_date = new Date();
    old_date.setDate(old_date.getDate() - 14);
    const old_period_key = old_date.toISOString().slice(0, 10);
    await redis.del(`rec:trending:z:${period}:${old_period_key}`);
  }

  async persist_from_redis() {
    await this.persist_trending_scores("day");
    await this.persist_trending_scores("week");
  }
}

export const trending_index_service = new TrendingIndexService();
