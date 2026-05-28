import "server-only";
import Redis from "ioredis";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";

const global_for_redis = globalThis as unknown as { redis?: Redis };

function create_redis() {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 10_000,
    retryStrategy: (times) => Math.min(times * 200, 5_000),
    reconnectOnError: (err) => /READONLY|ETIMEDOUT|ECONNRESET/.test(err.message),
  });
  client.on("error", (err) => logger.error("redis_error", { message: err.message }));
  client.on("connect", () => logger.info("redis_connected"));
  return client;
}

export const redis = global_for_redis.redis ?? create_redis();

if (env.NODE_ENV !== "production") global_for_redis.redis = redis;

export async function redis_health_check(): Promise<boolean> {
  try {
    return (await redis.ping()) === "PONG";
  } catch {
    return false;
  }
}

export async function rate_limit(key: string, limit: number, window_sec: number) {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, window_sec);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
