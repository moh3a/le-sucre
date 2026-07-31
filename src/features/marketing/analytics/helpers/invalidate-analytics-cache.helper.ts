import "server-only";
import { redis } from "@/lib/redis";

export async function invalidate_analytics_cache() {
  const keys = await redis.keys("analytics:overview:*");
  const more = await redis.keys("analytics:products:*");
  const all = [...keys, ...more, "analytics:realtime:snapshot"];
  if (all.length) await redis.del(...all);
}
