import "server-only";
import { redis } from "@/lib/redis";
import { RECOMMENDATION_CACHE_TTL } from "../constants/cache-keys";

export class RecommendationCacheService {
  async get<T>(key: string) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async set(key: string, value: unknown, ttl = RECOMMENDATION_CACHE_TTL.default) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }
  async invalidate_product(product_id: string) {
    const keys = await redis.keys(`rec:*:${product_id}:*`);
    if (keys.length) await redis.del(...keys);
  }
  async invalidate_all() {
    const keys = await redis.keys("rec:*");
    if (keys.length) await redis.del(...keys);
  }
}
export const recommendation_cache_service = new RecommendationCacheService();
