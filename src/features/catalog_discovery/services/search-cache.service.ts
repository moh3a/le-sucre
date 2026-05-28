import "server-only";

import { redis } from "@/lib/redis";
import { CATALOG_CACHE, CATALOG_CACHE_TTL } from "../constants/cache-keys";

export class SearchCacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttl_sec: number) {
    await redis.set(key, JSON.stringify(value), "EX", ttl_sec);
  }

  async invalidate_all() {
    const keys = await redis.keys("catalog:*");
    if (keys.length) await redis.del(...keys);
  }
}

export const search_cache_service = new SearchCacheService();
export { CATALOG_CACHE, CATALOG_CACHE_TTL };
