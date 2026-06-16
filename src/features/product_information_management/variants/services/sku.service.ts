import "server-only";

import { and, eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { inventory_levels } from "@/features/inventory_management_system/inventory/schema";
import { products } from "@/features/product_information_management/products/schema";
import { product_properties } from "../schema";

import type {
  create_sku_dto,
  update_sku_dto,
  generate_skus_dto,
  set_sku_price_tier_dto,
  delete_sku_price_tier_dto,
  upsert_wholesale_rule_dto,
  delete_wholesale_rule_dto,
  resolve_price_dto,
} from "../models/variant.dto";
import { property_repository } from "../repositories/property.repository";
import { sku_repository } from "../repositories/sku.repository";
import { pricing_repository } from "../repositories/pricing.repository";
import { sku_generation_engine } from "../engines/sku-generation.engine";
import { build_option_signature, build_sku_code } from "../engines/option-signature.engine";
import { resolve_unit_price } from "../engines/pricing.engine";
import { get_product_price_range } from "../engines/price-aggregation.engine";
import type { SkuListRow } from "../types";

function group_sku_rows(
  rows: Awaited<ReturnType<typeof sku_repository.list_with_option_labels>>,
): SkuListRow[] {
  const map = new Map<string, SkuListRow>();

  for (const row of rows) {
    if (!map.has(row.sku_id)) {
      map.set(row.sku_id, {
        sku_id: row.sku_id,
        sku_code: row.sku_code,
        option_signature: row.option_signature,
        is_active: row.is_active,
        stock_available: row.stock_available,
        base_price: row.base_price,
        offer_price: row.offer_price,
        currency: row.currency,
        options: [],
      });
    }

    if (row.value_id) {
      map.get(row.sku_id)!.options.push({
        property_code: row.property_code,
        value_code: row.value_code,
        value_label: row.value_label,
        value_id: row.value_id,
      });
    }
  }

  return Array.from(map.values());
}

export class SkuService {
  constructor(
    private readonly skus = sku_repository,
    private readonly properties = property_repository,
  ) {}

  private async ensure_inventory_level(sku_id: string) {
    const existing = await db
      .select()
      .from(inventory_levels)
      .where(and(eq(inventory_levels.sku_id, sku_id), eq(inventory_levels.warehouse_id, "default")))
      .limit(1);

    if (existing.length) return;

    await db.insert(inventory_levels).values({
      id: generate_id(),
      sku_id,
      warehouse_id: "default",
      quantity_on_hand: 0,
      quantity_reserved: 0,
      version: 0,
    });
  }

  async list_by_product(product_id: string) {
    const product = await this.skus.get_product(product_id);
    if (!product) throw new NotFoundError("Produit introuvable");

    const rows = await this.skus.list_with_option_labels(product_id);
    return { product_id, items: group_sku_rows(rows) };
  }

  async get_by_id(id: string) {
    const sku = await this.skus.find_by_id(id);
    if (!sku) throw new NotFoundError("SKU introuvable");

    const tiers = await pricing_repository.list_sku_price_tiers(id);
    const wholesale_sku = await pricing_repository.list_wholesale_rules_for_sku(id);
    const wholesale_product = await pricing_repository.list_wholesale_rules_for_product(
      sku.product_id,
    );

    return { sku, tiers, wholesale_rules: [...wholesale_sku, ...wholesale_product] };
  }

  async create(input: z.infer<typeof create_sku_dto>) {
    const product = await this.skus.get_product(input.product_id);
    if (!product) throw new NotFoundError("Produit introuvable");

    const values = await this.properties.get_values_by_ids(input.property_value_ids);
    if (values.length !== input.property_value_ids.length) {
      throw new NotFoundError("Une ou plusieurs valeurs de propriété sont introuvables");
    }

    const property_ids = new Set(values.map((v) => v.property_id));
    if (property_ids.size !== values.length) {
      throw new ConflictError("Une seule valeur par propriété est requise");
    }

    const props = await db
      .select()
      .from(product_properties)
      .where(eq(product_properties.product_id, input.product_id));

    const prop_by_id = new Map(props.map((p) => [p.id, p]));

    const pairs = values.map((v) => {
      const p = prop_by_id.get(v.property_id);
      if (!p) throw new ConflictError("Valeur de propriété invalide pour ce produit");
      return { property_code: p.code, value_code: v.code };
    });

    const signature = build_option_signature(pairs);
    const existing = await this.skus.find_by_signature(input.product_id, signature);
    if (existing) throw new ConflictError("Cette combinaison existe déjà");

    const sku_code = input.sku_code || build_sku_code(product.sku, signature);

    const sku = await this.skus.create_sku({
      product_id: input.product_id,
      sku_code,
      option_signature: signature,
      barcode: input.barcode ?? null,
      base_price: input.base_price != null ? String(input.base_price) : null,
      offer_price: input.offer_price != null ? String(input.offer_price) : null,
      currency: input.currency ?? product.currency,
      is_active: input.is_active,
      metadata: input.metadata ?? {},
    });

    await this.skus.attach_option_values(sku!.id, input.property_value_ids);
    await this.ensure_inventory_level(sku!.id);

    await db.update(products).set({ has_variants: true }).where(eq(products.id, input.product_id));

    return this.get_by_id(sku!.id);
  }

  async update(input: z.infer<typeof update_sku_dto>) {
    const current = await this.skus.find_by_id(input.id);
    if (!current) throw new NotFoundError("SKU introuvable");

    await this.skus.update_sku(input.id, {
      ...(input.sku_code !== undefined && { sku_code: input.sku_code }),
      ...(input.barcode !== undefined && { barcode: input.barcode }),
      ...(input.base_price !== undefined && {
        base_price: input.base_price != null ? String(input.base_price) : null,
      }),
      ...(input.offer_price !== undefined && {
        offer_price: input.offer_price != null ? String(input.offer_price) : null,
      }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
      ...(input.metadata !== undefined && { metadata: input.metadata }),
    });

    return this.get_by_id(input.id);
  }

  async remove(id: string) {
    return this.skus.delete_sku(id);
  }

  async generate(input: z.infer<typeof generate_skus_dto>) {
    const result = await sku_generation_engine.generate_for_product(input);
    await db.update(products).set({ has_variants: true }).where(eq(products.id, input.product_id));
    return result;
  }

  async set_price_tier(input: z.infer<typeof set_sku_price_tier_dto>) {
    const sku = await this.skus.find_by_id(input.sku_id);
    if (!sku) throw new NotFoundError("SKU introuvable");

    await pricing_repository.upsert_sku_price_tier({
      sku_id: input.sku_id,
      channel: input.channel,
      min_quantity: input.min_quantity,
      price: String(input.price),
      currency: input.currency,
      valid_from: input.valid_from ?? null,
      valid_to: input.valid_to ?? null,
    });

    return this.get_by_id(input.sku_id);
  }

  async delete_price_tier(input: z.infer<typeof delete_sku_price_tier_dto>) {
    return pricing_repository.delete_sku_price_tier(input);
  }

  async upsert_wholesale_rule(input: z.infer<typeof upsert_wholesale_rule_dto>) {
    const id = await pricing_repository.upsert_wholesale_rule({
      product_id: input.product_id ?? null,
      sku_id: input.sku_id ?? null,
      min_quantity: input.min_quantity,
      currency: input.currency,
      price: input.price != null ? String(input.price) : null,
      discount_percent: input.discount_percent != null ? String(input.discount_percent) : null,
      is_active: input.is_active,
    });
    return { id };
  }

  async delete_wholesale_rule(input: z.infer<typeof delete_wholesale_rule_dto>) {
    return pricing_repository.delete_wholesale_rule(input.id);
  }

  async resolve_price(input: z.infer<typeof resolve_price_dto>) {
    return resolve_unit_price(input);
  }

  async get_price_range(product_id: string) {
    return get_product_price_range(product_id);
  }

  async list_admin(input: { page: number; limit: number; search?: string; status?: string }) {
    return this.skus.list_admin(input);
  }

  async stats_admin() {
    return this.skus.stats_admin();
  }

  async bulk_update(input: {
    ids: string[];
    base_price?: number | null;
    offer_price?: number | null;
    stock_available?: number;
    is_active?: boolean;
  }) {
    await this.skus.bulk_update_skus(input.ids, {
      ...(input.base_price !== undefined && {
        base_price: input.base_price != null ? String(input.base_price) : null,
      }),
      ...(input.offer_price !== undefined && {
        offer_price: input.offer_price != null ? String(input.offer_price) : null,
      }),
      ...(input.stock_available !== undefined && {
        stock_available: input.stock_available,
      }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    });
    return { ok: true };
  }

  async bulk_delete(ids: string[]) {
    await this.skus.bulk_delete_skus(ids);
    return { ok: true };
  }
}

export const sku_service = new SkuService();
