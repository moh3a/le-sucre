import "server-only";
import { redis } from "@/lib/redis";

export async function invalidate_analytics_cache() {
  const overview = await redis.keys("analytics:overview:*");
  const products = await redis.keys("analytics:products:*");
  const product_detail = await redis.keys("analytics:product_detail:*");
  const search = await redis.keys("analytics:search:*");
  const all = [...overview, ...products, ...product_detail, ...search];
  if (all.length) await redis.del(...all);
}
