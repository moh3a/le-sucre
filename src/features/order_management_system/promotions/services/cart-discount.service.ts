import "server-only";

import { db } from "@/lib/db";
import { products } from "@/features/product_information_management/products/schema";
import { get_promotion_provider } from "../providers/provider-registry";
import { promotion_cache_service } from "./promotion-cache.service";
import { PROMOTION_CACHE } from "../constants/cache-keys";
import type { CartDiscountResult, CartLineForPromo } from "../types";
import { inArray } from "drizzle-orm";

export class CartDiscountService {
  async apply(input: {
    lines: Array<{
      sku_id: string;
      product_id: string;
      quantity: number;
      unit_price: string;
      line_total: string;
    }>;
    user_id?: string | null;
    promo_code?: string;
    shipping_cost: number;
  }) {
    const enriched = await this.enrich_lines(input.lines);
    const cache_key = PROMOTION_CACHE.cart(
      input.user_id ?? "guest",
      JSON.stringify({ lines: enriched, code: input.promo_code ?? "" }),
    );

    if (!input.promo_code) {
      const cached = await promotion_cache_service.get<CartDiscountResult>(cache_key);
      if (cached) return cached;
    }

    const result = await get_promotion_provider().compute_cart_discounts(enriched, {
      user_id: input.user_id,
      promo_code: input.promo_code,
      shipping_cost: input.shipping_cost,
    });

    if (!input.promo_code) await promotion_cache_service.set(cache_key, result, 120);
    return result;
  }

  private async enrich_lines(lines: CartLineForPromo[]) {
    const product_ids = [...new Set(lines.map((l) => l.product_id))];
    const rows = await db
      .select({ id: products.id, category_id: products.category_id })
      .from(products)
      .where(inArray(products.id, product_ids));
    const cat_map = new Map(rows.map((r) => [r.id, r.category_id]));
    return lines.map((l) => ({ ...l, category_id: cat_map.get(l.product_id) }));
  }
}
export const cart_discount_service = new CartDiscountService();
