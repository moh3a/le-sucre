import "server-only";
import { redis } from "@/lib/redis";
import { FORECAST_CACHE_TTL } from "../constants/cache-keys";

export class ForecastCacheService {
  async get<T>(key: string) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async set(key: string, value: unknown, ttl = FORECAST_CACHE_TTL.sku) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }
  async del(key: string) {
    await redis.del(key);
  }
}
export const forecast_cache_service = new ForecastCacheService();
