import { redis } from "@/lib/redis";
import {
  RATE_LIMIT_PRESETS,
  type RateLimitPreset,
  type RateLimitAction,
} from "@/lib/security/rate-limit-presets";
import logger from "./logger";

export interface RateLimitConfig {
  action: string;
  limit: number;
  windowSec: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const key = `ratelimit:${config.action}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSec * 1000;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, windowMs);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    const success = count <= config.limit;
    const remaining = Math.max(0, config.limit - count);
    const resetAt = now + windowMs;

    if (!success) {
      logger.warn("Rate limit exceeded", {
        identifier,
        action: config.action,
        count,
        limit: config.limit,
      });
    }

    return { success, remaining, resetAt, retryAfterSec: success ? 0 : config.windowSec };
  } catch (err) {
    logger.error("Rate limiter Redis error allowing request", { err });
    return { success: true, remaining: config.limit, resetAt: now + windowMs, retryAfterSec: 0 };
  }
}

export async function rateLimitWithPreset(
  identifier: string,
  action: RateLimitAction,
): Promise<RateLimitResult> {
  const preset = RATE_LIMIT_PRESETS[action] as RateLimitPreset;
  return rateLimit(identifier, {
    action: preset.action,
    limit: preset.limit,
    windowSec: preset.window_sec,
  });
}

export const RATE_LIMITS = {
  login: { action: "login", limit: 5, windowSec: 60 },
  register: { action: "register", limit: 3, windowSec: 60 * 60 },
  passwordReset: { action: "password_reset", limit: 3, windowSec: 60 * 15 },
  api: { action: "api", limit: 100, windowSec: 60 },
  adminApi: { action: "admin_api", limit: 200, windowSec: 60 },
} as const satisfies Record<string, RateLimitConfig>;

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headers.get("x-real-ip") ?? "unknown"
  );
}
