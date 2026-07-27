import "server-only";

import { and, desc, eq, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { generate_id } from "@/lib/utils";
import { SKU_ERROR } from "../constants/error-codes";
import { sku_prices } from "../schema";

export class PricingRepository {
  async list_sku_price_tiers(sku_id: string) {
    return db
      .select()
      .from(sku_prices)
      .where(eq(sku_prices.sku_id, sku_id))
      .orderBy(desc(sku_prices.channel), desc(sku_prices.min_quantity));
  }

  async upsert_sku_price_tier(input: {
    sku_id: string;
    channel: string;
    min_quantity: number;
    price: string;
    currency: string;
    valid_from?: string | null;
    valid_to?: string | null;
  }) {
    // unique should be enforced logically by (sku_id, channel, min_quantity); we do check-then-update
    const existing = await db
      .select()
      .from(sku_prices)
      .where(
        and(
          eq(sku_prices.sku_id, input.sku_id),
          eq(sku_prices.channel, input.channel),
          eq(sku_prices.min_quantity, input.min_quantity),
        ),
      )
      .limit(1);

    if (existing.length) {
      await db
        .update(sku_prices)
        .set({
          price: input.price,
          currency: input.currency,
          valid_from: input.valid_from ?? null,
          valid_to: input.valid_to ?? null,
        })
        .where(eq(sku_prices.id, existing[0]!.id));
      return existing[0]!.id;
    }

    const id = generate_id();
    await db.insert(sku_prices).values({
      id,
      sku_id: input.sku_id,
      channel: input.channel,
      min_quantity: input.min_quantity,
      price: input.price,
      currency: input.currency,
      valid_from: input.valid_from ?? null,
      valid_to: input.valid_to ?? null,
    });
    return id;
  }

  async delete_sku_price_tier(input: { sku_id: string; channel: string; min_quantity: number }) {
    const existing = await db
      .select()
      .from(sku_prices)
      .where(
        and(
          eq(sku_prices.sku_id, input.sku_id),
          eq(sku_prices.channel, input.channel),
          eq(sku_prices.min_quantity, input.min_quantity),
        ),
      )
      .limit(1);
    if (!existing.length) throw_error(SKU_ERROR.PRICE_TIER_NOT_FOUND);
    await db.delete(sku_prices).where(eq(sku_prices.id, existing[0]!.id));
    return { ok: true };
  }

  async find_best_sku_tier(input: {
    sku_id: string;
    channel: string;
    quantity: number;
    currency?: string;
  }) {
    const rows = await db
      .select()
      .from(sku_prices)
      .where(
        and(
          eq(sku_prices.sku_id, input.sku_id),
          eq(sku_prices.channel, input.channel),
          lte(sku_prices.min_quantity, input.quantity),
        ),
      )
      .orderBy(desc(sku_prices.min_quantity))
      .limit(1);

    const tier = rows[0] ?? null;
    if (!tier) return null;
    if (input.currency && tier.currency !== input.currency) return null;
    return tier;
  }
}

export const pricing_repository = new PricingRepository();
