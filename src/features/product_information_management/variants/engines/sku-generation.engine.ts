import "server-only";

import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";

import { products } from "@/features/product_information_management/products/schema";
import { product_properties, property_values, product_skus, sku_option_values } from "../schema";
import type { GenerateSkusResult, OptionPair } from "../types";
import { cartesian_combinations } from "./variant-combination.engine";
import { build_option_signature, build_sku_code } from "./option-signature.engine";
import { and, eq, inArray } from "drizzle-orm";
import { inventory_levels } from "@/features/inventory_management_system/inventory/schema";

const INSERT_CHUNK = 500;

export class SkuGenerationEngine {
  async reset_skus_for_product(product_id: string) {
    const skus = await db
      .select()
      .from(product_skus)
      .where(eq(product_skus.product_id, product_id));
    for (const sku of skus) {
      await Promise.all([
        db.delete(product_skus).where(eq(product_skus.id, sku.id)),
        db.delete(inventory_levels).where(eq(inventory_levels.sku_id, sku.id)),
        db.delete(sku_option_values).where(eq(sku_option_values.sku_id, sku.id)),
      ]);
    }
  }

  async generate_for_product(input: {
    product_id: string;
    max_combinations: number;
  }): Promise<GenerateSkusResult> {
    await this.reset_skus_for_product(input.product_id);
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.product_id))
      .limit(1);
    if (!product) throw new NotFoundError("Produit introuvable");

    const properties = await db
      .select()
      .from(product_properties)
      .where(eq(product_properties.product_id, input.product_id))
      .orderBy(product_properties.sort_order);

    if (!properties.length) {
      throw new ConflictError("Aucune propriété configurée pour ce produit");
    }

    const values = await db
      .select()
      .from(property_values)
      .where(
        inArray(
          property_values.property_id,
          properties.map((p) => p.id),
        ),
      )
      .orderBy(property_values.sort_order);

    const values_by_property = new Map<string, typeof values>();
    for (const p of properties) values_by_property.set(p.id, []);
    for (const v of values) {
      const list = values_by_property.get(v.property_id) ?? [];
      list.push(v);
      values_by_property.set(v.property_id, list);
    }

    const groups = properties.map((p) => values_by_property.get(p.id) ?? []);
    if (groups.some((g) => g.length === 0)) {
      throw new ConflictError("Chaque propriété doit avoir au moins une valeur");
    }

    const all_combos = cartesian_combinations(groups);
    const attempted = all_combos.length;
    const capped = attempted > input.max_combinations;
    const combos = capped ? all_combos.slice(0, input.max_combinations) : all_combos;

    // Build signatures for existence checks
    const signature_rows = combos.map((combo) => {
      const pairs: OptionPair[] = combo.map((value, idx) => ({
        property_code: properties[idx]!.code,
        value_code: value.code,
      }));
      const signature = build_option_signature(pairs);
      return { signature, value_ids: combo.map((v) => v.id) };
    });

    const existing = await db
      .select({ option_signature: product_skus.option_signature })
      .from(product_skus)
      .where(
        and(
          eq(product_skus.product_id, input.product_id),
          inArray(
            product_skus.option_signature,
            signature_rows.map((r) => r.signature),
          ),
        ),
      );

    const existing_set = new Set(existing.map((e) => e.option_signature));

    let created = 0;
    let skipped = 0;

    // Insert in transaction chunks
    for (let i = 0; i < signature_rows.length; i += INSERT_CHUNK) {
      const batch = signature_rows.slice(i, i + INSERT_CHUNK);

      const to_create = batch.filter((b) => !existing_set.has(b.signature));
      skipped += batch.length - to_create.length;

      if (!to_create.length) continue;

      await db.transaction(async (tx) => {
        const sku_inserts = to_create.map((row) => {
          const sku_id = generate_id();
          const sku_code = build_sku_code(product.sku, row.signature);
          return {
            sku_id,
            sku_code,
            option_signature: row.signature,
            value_ids: row.value_ids,
          };
        });

        await tx.insert(product_skus).values(
          sku_inserts.map((r) => ({
            id: r.sku_id,
            product_id: input.product_id,
            sku_code: r.sku_code,
            option_signature: r.option_signature,
            barcode: null,
            base_price: null,
            offer_price: null,
            currency: product.currency,
            is_active: true,
            stock_available: 0,
            metadata: {},
          })),
        );

        await tx.insert(inventory_levels).values(
          sku_inserts.map((r) => ({
            id: generate_id(),
            sku_id: r.sku_id,
            warehouse_id: "default",
            quantity_on_hand: 0,
            quantity_reserved: 0,
            version: 0,
          })),
        );

        const option_rows = sku_inserts.flatMap((r) =>
          r.value_ids.map((value_id) => ({
            sku_id: r.sku_id,
            property_value_id: value_id,
          })),
        );

        await tx.insert(sku_option_values).values(option_rows);
      });

      created += to_create.length;
    }

    return { created, skipped, capped, attempted };
  }
}

export const sku_generation_engine = new SkuGenerationEngine();
