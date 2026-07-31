import "server-only";
import { redis } from "@/lib/redis";

export class AnalyticsCacheService {
  get<T>(key: string) {
    return redis.get(key).then((r) => (r ? (JSON.parse(r) as T) : null));
  }
  set(key: string, value: unknown, ttl = 300) {
    return redis.set(key, JSON.stringify(value), "EX", ttl);
  }
}
export const analytics_cache_service = new AnalyticsCacheService();
