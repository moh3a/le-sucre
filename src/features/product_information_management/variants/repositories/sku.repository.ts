import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";

import { products } from "@/features/product_information_management/products/schema";
import { product_properties, property_values, product_skus, sku_option_values } from "../schema";

export class SkuRepository {
  async get_product(product_id: string) {
    const [row] = await db.select().from(products).where(eq(products.id, product_id)).limit(1);
    return row ?? null;
  }

  async find_by_id(id: string) {
    const [row] = await db.select().from(product_skus).where(eq(product_skus.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_signature(product_id: string, option_signature: string) {
    const [row] = await db
      .select()
      .from(product_skus)
      .where(
        and(
          eq(product_skus.product_id, product_id),
          eq(product_skus.option_signature, option_signature),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async list_by_product(product_id: string) {
    return db
      .select()
      .from(product_skus)
      .where(eq(product_skus.product_id, product_id))
      .orderBy(asc(product_skus.sku_code));
  }

  async list_with_option_labels(product_id: string) {
    // returns rows repeated per option value; caller can group by sku_id
    return db
      .select({
        sku_id: product_skus.id,
        sku_code: product_skus.sku_code,
        option_signature: product_skus.option_signature,
        is_active: product_skus.is_active,
        stock_available: product_skus.stock_available,
        base_price: product_skus.base_price,
        offer_price: product_skus.offer_price,
        currency: product_skus.currency,
        property_code: product_properties.code,
        value_code: property_values.code,
        value_label: property_values.label,
        value_id: property_values.id,
      })
      .from(product_skus)
      .leftJoin(sku_option_values, eq(sku_option_values.sku_id, product_skus.id))
      .leftJoin(property_values, eq(property_values.id, sku_option_values.property_value_id))
      .leftJoin(product_properties, eq(product_properties.id, property_values.property_id))
      .where(eq(product_skus.product_id, product_id))
      .orderBy(
        asc(product_skus.sku_code),
        asc(product_properties.sort_order),
        asc(property_values.sort_order),
      );
  }

  async create_sku(input: {
    product_id: string;
    sku_code: string;
    option_signature: string;
    barcode?: string | null;
    base_price?: string | null;
    offer_price?: string | null;
    currency?: string | null;
    is_active: boolean;
    metadata: Record<string, unknown>;
  }) {
    const existing = await this.find_by_signature(input.product_id, input.option_signature);
    if (existing) throw new ConflictError("Ce SKU (combinaison) existe déjà");

    const id = generate_id();
    await db.insert(product_skus).values({
      id,
      product_id: input.product_id,
      sku_code: input.sku_code,
      option_signature: input.option_signature,
      barcode: input.barcode ?? null,
      base_price: input.base_price ?? null,
      offer_price: input.offer_price ?? null,
      currency: input.currency ?? null,
      is_active: input.is_active,
      stock_available: 0,
      metadata: input.metadata,
    });

    return this.find_by_id(id);
  }

  async attach_option_values(sku_id: string, property_value_ids: string[]) {
    if (!property_value_ids.length) return;

    const rows = property_value_ids.map((id) => ({
      sku_id,
      property_value_id: id,
    }));

    // idempotent insert: check existing then insert only missing
    const existing = await db
      .select()
      .from(sku_option_values)
      .where(
        and(
          eq(sku_option_values.sku_id, sku_id),
          inArray(sku_option_values.property_value_id, property_value_ids),
        ),
      );

    const existing_set = new Set(existing.map((r) => r.property_value_id));
    const to_insert = rows.filter((r) => !existing_set.has(r.property_value_id));

    if (to_insert.length) {
      await db.insert(sku_option_values).values(to_insert);
    }
  }

  async update_sku(
    id: string,
    input: Partial<{
      sku_code: string;
      barcode: string | null;
      base_price: string | null;
      offer_price: string | null;
      currency: string | null;
      is_active: boolean;
      metadata: Record<string, unknown>;
    }>,
  ) {
    const current = await this.find_by_id(id);
    if (!current) throw new NotFoundError("SKU introuvable");

    await db
      .update(product_skus)
      .set({
        ...(input.sku_code !== undefined && { sku_code: input.sku_code }),
        ...(input.barcode !== undefined && { barcode: input.barcode }),
        ...(input.base_price !== undefined && { base_price: input.base_price }),
        ...(input.offer_price !== undefined && { offer_price: input.offer_price }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
      })
      .where(eq(product_skus.id, id));

    return this.find_by_id(id);
  }

  async delete_sku(id: string) {
    const current = await this.find_by_id(id);
    if (!current) throw new NotFoundError("SKU introuvable");
    await db.delete(product_skus).where(eq(product_skus.id, id));
    return { ok: true };
  }
}

export const sku_repository = new SkuRepository();
