import "server-only";
import { redis } from "@/lib/redis";

/**
 * Generates an invoice number in the format: TYPE-YYYYMMDD-XXXX
 * using a Redis atomic increment.
 */
export async function generate_sequential_number(type: "INV" | "REF" | "CN"): Promise<string> {
  const now = new Date();
  const date_str = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const redis_key = `finance:seq:${type}:${date_str}`;

  const count = await redis.incr(redis_key);
  if (count === 1) {
    // Set expiry of 30 hours to make sure the key cleanup runs fine after day ends
    await redis.expire(redis_key, 60 * 60 * 30);
  }

  const padded_count = String(count).padStart(4, "0");
  return `${type}-${date_str}-${padded_count}`;
}
