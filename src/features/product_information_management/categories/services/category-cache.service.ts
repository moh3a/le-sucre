import "server-only";
import { redis } from "@/lib/redis";
import { CATEGORY_CACHE, CATEGORY_CACHE_TTL_SEC } from "../constants/cache-keys";

export class CategoryCacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttl = CATEGORY_CACHE_TTL_SEC) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }

  async invalidate_all() {
    const keys = await redis.keys("category:*");
    if (keys.length) await redis.del(...keys);
  }

  async invalidate_category(category_id: string) {
    await redis.del(
      CATEGORY_CACHE.descendants(category_id),
      CATEGORY_CACHE.ancestors(category_id),
      CATEGORY_CACHE.admin_tree,
      CATEGORY_CACHE.storefront_tree,
    );
  }
}

export const category_cache_service = new CategoryCacheService();
