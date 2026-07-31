import "server-only";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { feature_flags } from "../schema";
import { eq, and } from "drizzle-orm";

const CACHE_PREFIX = "feature_flag:";
const CACHE_TTL = 300;

/**
 * Server-side utility to check if a feature flag is enabled.
 * Uses Redis cache with DB fallback.
 * Use this in server components, API routes, and middleware.
 */
export async function is_feature_enabled(key: string): Promise<boolean> {
  try {
    const cached = await redis.get(`${CACHE_PREFIX}${key}`);
    if (cached === "1") return true;
    if (cached === "0") return false;

    const [flag] = await db
      .select({ enabled: feature_flags.enabled })
      .from(feature_flags)
      .where(and(eq(feature_flags.key, key), eq(feature_flags.enabled, true)))
      .limit(1);

    const enabled = flag?.enabled ?? false;

    await redis.setex(`${CACHE_PREFIX}${key}`, CACHE_TTL, enabled ? "1" : "0");

    return enabled;
  } catch {
    return false;
  }
}
