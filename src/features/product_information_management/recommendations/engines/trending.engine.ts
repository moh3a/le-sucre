import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { product_trending_scores } from "../schema";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";

export function trending_period_key(period: "day" | "week") {
  const d = new Date();
  if (period === "day") return d.toISOString().slice(0, 10);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function increment_trending_signal(product_id: string, kind: "view" | "order") {
  const period = "day";
  const period_key = trending_period_key(period);
  const view_key = redisKeys.analytics.productViews(product_id);
  if (kind === "view") await redis.incr(view_key);
  if (kind === "order") await redis.incr(`${view_key}:orders`);

  // lightweight hot counter; indexer persists to MySQL
  await redis.zincrby(
    `rec:trending:z:${period}:${period_key}`,
    kind === "order" ? 3 : 1,
    product_id,
  );
}

export async function list_trending_product_ids(period: "day" | "week", limit: number) {
  const period_key = trending_period_key(period);
  const rows = await db
    .select({
      product_id: product_trending_scores.product_id,
      score: product_trending_scores.score,
    })
    .from(product_trending_scores)
    .where(
      and(
        eq(product_trending_scores.period, period),
        eq(product_trending_scores.period_key, period_key),
      ),
    )
    .orderBy(desc(product_trending_scores.rank))
    .limit(limit);

  return rows.map((r) => ({ product_id: r.product_id, score: Number(r.score) }));
}
