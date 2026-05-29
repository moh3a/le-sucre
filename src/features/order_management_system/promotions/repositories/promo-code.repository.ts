import "server-only";
import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { promo_codes, promotion_redemptions } from "../schema";

export class PromoCodeRepository {
  async find_by_code(code: string) {
    const normalized = code.trim().toUpperCase();
    const [row] = await db
      .select()
      .from(promo_codes)
      .where(eq(promo_codes.code, normalized))
      .limit(1);
    return row ?? null;
  }

  async count_customer_usage(promo_code_id: string, user_id: string) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(promotion_redemptions)
      .where(
        and(
          eq(promotion_redemptions.promo_code_id, promo_code_id),
          eq(promotion_redemptions.user_id, user_id),
        ),
      );
    return Number(total ?? 0);
  }

  async increment_usage(promo_code_id: string) {
    await db
      .update(promo_codes)
      .set({ usage_count: sql`${promo_codes.usage_count} + 1` })
      .where(eq(promo_codes.id, promo_code_id));
  }

  async create(input: typeof promo_codes.$inferInsert) {
    await db.insert(promo_codes).values({
      ...input,
      id: input.id ?? generate_id(),
      code: input.code.toUpperCase(),
    });
    return this.find_by_code(input.code);
  }
}

export const promo_code_repository = new PromoCodeRepository();
