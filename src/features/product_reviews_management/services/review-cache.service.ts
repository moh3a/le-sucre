import "server-only";
import { redis } from "@/lib/redis";
import { REVIEW_CACHE, REVIEW_CACHE_TTL } from "../constants/cache-keys";

export class ReviewCacheService {
  async get<T>(key: string) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async set(key: string, value: unknown, ttl: number = REVIEW_CACHE_TTL.list) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }
  async invalidate_product(product_id: string) {
    const keys = await redis.keys(`reviews:*:${product_id}*`);
    if (keys.length) await redis.del(...keys);
    await redis.del(REVIEW_CACHE.summary(product_id));
  }
}

export const review_cache_service = new ReviewCacheService();
