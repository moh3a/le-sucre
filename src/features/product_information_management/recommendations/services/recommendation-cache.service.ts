import "server-only";
import { redis } from "@/lib/redis";
import { RECOMMENDATION_CACHE_TTL } from "../constants/cache-keys";
import { tryFn } from "@/lib/error_handling";

export class RecommendationCacheService {
  async get<T>(key: string) {
    const [err, raw] = await tryFn(redis.get(key));
    if (err) return null;
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async set(key: string, value: unknown, ttl = RECOMMENDATION_CACHE_TTL.default) {
    const [err] = await tryFn(redis.set(key, JSON.stringify(value), "EX", ttl));
    void err;
  }
  async invalidate_product(product_id: string) {
    const [err, keys] = await tryFn(redis.keys(`rec:*:${product_id}:*`));
    if (!err && keys?.length) {
      const [del_err] = await tryFn(redis.del(...keys));
      void del_err;
    }
  }
  async invalidate_all() {
    const [err, keys] = await tryFn(redis.keys("rec:*"));
    if (!err && keys?.length) {
      const [del_err] = await tryFn(redis.del(...keys));
      void del_err;
    }
  }
}
export const recommendation_cache_service = new RecommendationCacheService();
