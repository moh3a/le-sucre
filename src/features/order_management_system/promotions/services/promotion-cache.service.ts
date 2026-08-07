import "server-only";
import { redis } from "@/lib/redis";
import { PROMOTION_CACHE_TTL } from "../constants/cache-keys";

export class PromotionCacheService {
  async get<T>(key: string) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttl_sec: number = PROMOTION_CACHE_TTL.active) {
    await redis.set(key, JSON.stringify(value), "EX", ttl_sec);
  }
}

export const promotion_cache_service = new PromotionCacheService();