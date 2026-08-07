import "server-only";
import { redis } from "@/lib/redis";
import { db, type DbClient } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { promotion_redemptions } from "../schema";
import { PROMOTION_CACHE } from "../constants/cache-keys";

type Tx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

export async function track_promotion_redemption(
  input: {
    promotion_id: string;
    promo_code_id?: string | null;
    order_id?: string;
    user_id?: string | null;
    discount_amount: string;
  },
  tx?: Tx,
) {
  await redis.hincrby(PROMOTION_CACHE.analytics(input.promotion_id), "redemptions", 1);
  const client = tx ?? db;
  await client.insert(promotion_redemptions).values({ id: generate_id(), ...input });
}
