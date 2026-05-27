import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/error_handling";
import { products } from "@/features/product_information_management/products/schema";
import { product_skus } from "../schema";
import { pricing_repository } from "../repositories/pricing.repository";
import { apply_wholesale_rule } from "./wholesale-pricing.engine";
import type { PriceResolution } from "../types";

export async function resolve_unit_price(input: {
  sku_id: string;
  product_id: string;
  quantity: number;
  channel: "retail" | "wholesale";
  currency?: string;
}): Promise<PriceResolution> {
  // 1) SKU tier prices
  const tier = await pricing_repository.find_best_sku_tier({
    sku_id: input.sku_id,
    channel: input.channel,
    quantity: input.quantity,
    currency: input.currency,
  });

  if (tier) {
    return {
      unit_price: String(tier.price),
      currency: tier.currency,
      source: "sku_price_tier",
    };
  }

  // 2) Wholesale rules (sku then product)
  if (input.channel === "wholesale") {
    const rule = await pricing_repository.find_best_wholesale_rule({
      product_id: input.product_id,
      sku_id: input.sku_id,
      quantity: input.quantity,
      currency: input.currency,
    });

    if (rule) {
      // base for discount is resolved retail base (sku offer/base -> product offer/base)
      const base = await resolve_unit_price({
        sku_id: input.sku_id,
        product_id: input.product_id,
        quantity: 1,
        channel: "retail",
        currency: input.currency,
      });

      const applied = apply_wholesale_rule({
        base_unit_price: base.unit_price,
        currency: base.currency,
        quantity: input.quantity,
        rule,
      });

      return {
        unit_price: applied.unit_price,
        currency: applied.currency,
        source: rule.sku_id ? "wholesale_rule_sku" : "wholesale_rule_product",
      };
    }
  }

  // 3) fallback to SKU price, then product price
  const [sku] = await db
    .select()
    .from(product_skus)
    .where(eq(product_skus.id, input.sku_id))
    .limit(1);
  if (!sku) throw new NotFoundError("SKU introuvable");

  if (sku.offer_price != null) {
    return {
      unit_price: String(sku.offer_price),
      currency: sku.currency ?? input.currency ?? "DZD",
      source: "sku_offer",
    };
  }

  if (sku.base_price != null) {
    return {
      unit_price: String(sku.base_price),
      currency: sku.currency ?? input.currency ?? "DZD",
      source: "sku_base",
    };
  }

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
      source: "product_offer",
    };
  }

  return {
    unit_price: String(product.base_price),
    currency: product.currency ?? input.currency ?? "DZD",
    source: "product_base",
  };
}
