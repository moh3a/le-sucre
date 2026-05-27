import { redis } from "@/lib/redis";
import logger from "./logger";

export interface RateLimitConfig {
  /** unique action name e.g. "login", "register" */
  action: string;
  /** max requests in the window */
  limit: number;
  /** window in seconds */
  windowSec: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // unix ms
  retryAfterSec: number;
}

/**
 * Sliding-window rate limiter backed by Redis.
 * Key format: ratelimit:{action}:{identifier}
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const key = `ratelimit:${config.action}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSec * 1000;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs);        // remove expired
    pipeline.zadd(key, now, `${now}-${Math.random()}`);       // add current
    pipeline.zcard(key);                                       // count
    pipeline.pexpire(key, windowMs);                          // auto-expire

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    const success = count <= config.limit;
    const remaining = Math.max(0, config.limit - count);
    const resetAt = now + windowMs;

    if (!success) {
      logger.warn("Rate limit exceeded", { identifier, action: config.action, count });
    }

    return { success, remaining, resetAt, retryAfterSec: success ? 0 : config.windowSec };
  } catch (err) {
    logger.error("Rate limiter Redis error — allowing request", { err });
    // Fail open: if Redis is down, don't block traffic
    return { success: true, remaining: config.limit, resetAt: now + windowMs, retryAfterSec: 0 };
  }
}

// ─── Preset configs ──────────────────────────────────────
export const RATE_LIMITS = {
  login: { action: "login", limit: 5, windowSec: 60 },
  register: { action: "register", limit: 3, windowSec: 60 * 60 },
  passwordReset: { action: "password_reset", limit: 3, windowSec: 60 * 15 },
  api: { action: "api", limit: 100, windowSec: 60 },
  adminApi: { action: "admin_api", limit: 200, windowSec: 60 },
} as const satisfies Record<string, RateLimitConfig>;

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
