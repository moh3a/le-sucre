import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/error_handling";
import { products, product_units } from "@/features/product_information_management/products/schema";
import { product_skus } from "../schema";
import { pricing_repository } from "../repositories/pricing.repository";
import type { PriceResolution } from "../types";

export async function resolve_unit_price(input: {
  sku_id: string;
  product_id: string;
  quantity: number;
  channel: "retail" | "wholesale";
  currency?: string;
}): Promise<PriceResolution> {
  // 1) SKU tier prices (works for both retail and wholesale channels)
  const tier = await pricing_repository.find_best_sku_tier({
    sku_id: input.sku_id,
    channel: input.channel,
    quantity: input.quantity,
    currency: input.currency,
  });

  if (tier) {
    // Fetch the product unit for display info
    const unit = await get_product_unit(input.product_id, input.channel);
    return {
      unit_price: String(tier.price),
      currency: tier.currency,
      unit_name: unit?.unit_name ?? input.channel,
      pieces_per_unit: unit?.pieces_per_unit ?? 1,
      source: "sku_price_tier",
    };
  }

  // 2) SKU-level prices for the channel
  const [sku] = await db
    .select()
    .from(product_skus)
    .where(eq(product_skus.id, input.sku_id))
    .limit(1);
  if (!sku) throw new NotFoundError("SKU introuvable");

  const unit = await get_product_unit(input.product_id, input.channel);
  const unit_name = unit?.unit_name ?? input.channel;
  const pieces_per_unit = unit?.pieces_per_unit ?? 1;

  if (input.channel === "wholesale") {
    if (sku.wholesale_offer_price != null) {
      return {
        unit_price: String(sku.wholesale_offer_price),
        currency: sku.currency ?? input.currency ?? "DZD",
        unit_name,
        pieces_per_unit,
        source: "sku_wholesale_offer",
      };
    }
    if (sku.wholesale_base_price != null) {
      return {
        unit_price: String(sku.wholesale_base_price),
        currency: sku.currency ?? input.currency ?? "DZD",
        unit_name,
        pieces_per_unit,
        source: "sku_wholesale_base",
      };
    }
  }

  // 3) SKU retail prices (offer then base)
  if (sku.offer_price != null) {
    return {
      unit_price: String(sku.offer_price),
      currency: sku.currency ?? input.currency ?? "DZD",
      unit_name,
      pieces_per_unit,
      source: "sku_offer",
    };
  }

  if (sku.base_price != null) {
    return {
      unit_price: String(sku.base_price),
      currency: sku.currency ?? input.currency ?? "DZD",
      unit_name,
      pieces_per_unit,
      source: "sku_base",
    };
  }

  // 4) Product unit prices
  if (unit) {
    if (unit.offer_price != null) {
      return {
        unit_price: String(unit.offer_price),
        currency: unit.currency ?? input.currency ?? "DZD",
        unit_name: unit.unit_name,
        pieces_per_unit: unit.pieces_per_unit,
        source: "product_unit_offer",
      };
    }
    return {
      unit_price: String(unit.base_price),
      currency: unit.currency ?? input.currency ?? "DZD",
      unit_name: unit.unit_name,
      pieces_per_unit: unit.pieces_per_unit,
      source: "product_unit_base",
    };
  }

  // 5) Fallback to legacy product prices
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, input.product_id))
    .limit(1);
  if (!product) throw new NotFoundError("Produit introuvable");

  if (product.offer_price != null) {
    return {
      unit_price: String(product.offer_price),
      currency: product.currency ?? input.currency ?? "DZD",
      unit_name: input.channel,
      pieces_per_unit: 1,
      source: "product_offer",
    };
  }

  return {
    unit_price: String(product.base_price),
    currency: product.currency ?? input.currency ?? "DZD",
    unit_name: input.channel,
    pieces_per_unit: 1,
    source: "product_base",
  };
}

async function get_product_unit(product_id: string, channel: string) {
  const [unit] = await db
    .select()
    .from(product_units)
    .where(and(eq(product_units.product_id, product_id), eq(product_units.channel, channel)))
    .limit(1);
  return unit ?? null;
}
