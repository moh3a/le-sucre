import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { product_units } from "../schema";

export class ProductUnitsRepository {
  async list_by_product(product_id: string) {
    return db
      .select()
      .from(product_units)
      .where(eq(product_units.product_id, product_id))
      .orderBy(product_units.channel);
  }

  async get_by_channel(product_id: string, channel: string) {
    const [row] = await db
      .select()
      .from(product_units)
      .where(and(eq(product_units.product_id, product_id), eq(product_units.channel, channel)))
      .limit(1);
    return row ?? null;
  }

  async upsert(input: {
    product_id: string;
    channel: string;
    unit_name: string;
    pieces_per_unit: number;
    base_price: string;
    offer_price?: string | null;
    currency: string;
    is_active?: boolean;
  }) {
    const existing = await this.get_by_channel(input.product_id, input.channel);

    if (existing) {
      await db
        .update(product_units)
        .set({
          unit_name: input.unit_name,
          pieces_per_unit: input.pieces_per_unit,
          base_price: input.base_price,
          offer_price: input.offer_price ?? null,
          currency: input.currency,
          ...(input.is_active !== undefined && { is_active: input.is_active }),
        })
        .where(eq(product_units.id, existing.id));
      return existing.id;
    }

    const id = generate_id();
    await db.insert(product_units).values({
      id,
      product_id: input.product_id,
      channel: input.channel,
      unit_name: input.unit_name,
      pieces_per_unit: input.pieces_per_unit,
      base_price: input.base_price,
      offer_price: input.offer_price ?? null,
      currency: input.currency,
      is_active: input.is_active ?? true,
    });
    return id;
  }

  async ensure_default_units(
    product_id: string,
    data: {
      retail_unit_name: string;
      wholesale_unit_name: string;
      wholesale_pieces_per_unit: number;
      base_price: string;
      offer_price?: string | null;
      wholesale_base_price?: string | null;
      wholesale_offer_price?: string | null;
      currency: string;
    },
  ) {
    const existing = await this.list_by_product(product_id);
    if (existing.length > 0) return existing;

    const retail_id = generate_id();
    const wholesale_id = generate_id();

    await db.insert(product_units).values([
      {
        id: retail_id,
        product_id,
        channel: "retail",
        unit_name: data.retail_unit_name,
        pieces_per_unit: 1,
        base_price: data.base_price,
        offer_price: data.offer_price ?? null,
        currency: data.currency,
        is_active: true,
      },
      {
        id: wholesale_id,
        product_id,
        channel: "wholesale",
        unit_name: data.wholesale_unit_name,
        pieces_per_unit: data.wholesale_pieces_per_unit,
        base_price: data.wholesale_base_price ?? data.base_price,
        offer_price: data.wholesale_offer_price ?? data.offer_price ?? null,
        currency: data.currency,
        is_active: true,
      },
    ]);

    return this.list_by_product(product_id);
  }

  async delete_by_channel(product_id: string, channel: string) {
    const existing = await this.get_by_channel(product_id, channel);
    if (!existing) return { ok: true };
    await db.delete(product_units).where(eq(product_units.id, existing.id));
    return { ok: true };
  }
}

export const product_units_repository = new ProductUnitsRepository();
