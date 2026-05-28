import "server-only";
import { db } from "@/lib/db";
import { redis_health_check } from "@/lib/redis";
import { sql } from "drizzle-orm";

export async function get_health_status() {
  const checks = {
    mysql: false,
    redis: false,
    uptime_sec: Math.floor(process.uptime()),
    version: process.env.npm_package_version ?? "unknown",
  };

  try {
    await db.execute(sql`SELECT 1`);
    checks.mysql = true;
  } catch {}

  checks.redis = await redis_health_check();

  const ok = checks.mysql && checks.redis;
  return { ok, checks };
}
