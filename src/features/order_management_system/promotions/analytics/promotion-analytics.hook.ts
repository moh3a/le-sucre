import "server-only";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { promotion_redemptions } from "../schema";

export async function track_promotion_redemption(input: {
  promotion_id: string;
  promo_code_id?: string | null;
  order_id?: string;
  user_id?: string | null;
  discount_amount: string;
}) {
  await redis.hincrby(`promo:analytics:${input.promotion_id}`, "redemptions", 1);
  await db.insert(promotion_redemptions).values({ id: generate_id(), ...input });
}
