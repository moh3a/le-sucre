import "server-only";
import { redis } from "@/lib/redis";
import { PROMOTION_CACHE } from "../constants/cache-keys";

export async function invalidate_promotion_cache() {
  const keys = await redis.keys("promo:*");
  if (keys.length) await redis.del(...keys);
  await redis.del(PROMOTION_CACHE.active());
  await redis.del(PROMOTION_CACHE.flash());
}