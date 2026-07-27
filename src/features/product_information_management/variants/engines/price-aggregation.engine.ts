import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, product_units } from "@/features/product_information_management/products/schema";
import { product_skus } from "../schema";

export async function get_product_price_range(product_id: string): Promise<{
  retail: { min_price: string; max_price: string; currency: string };
  wholesale: { min_price: string; max_price: string; currency: string };
}> {
  // Get retail unit
  const [retail_unit] = await db
    .select()
    .from(product_units)
    .where(and(eq(product_units.product_id, product_id), eq(product_units.channel, "retail")))
    .limit(1);

  // Get wholesale unit
  const [wholesale_unit] = await db
    .select()
    .from(product_units)
    .where(and(eq(product_units.product_id, product_id), eq(product_units.channel, "wholesale")))
    .limit(1);

  // Retail price range from SKUs
  const [retail_row] = await db
    .select({
      min_price: sql<string>`MIN(COALESCE(${product_skus.offer_price}, ${product_skus.base_price}, ${product_units.offer_price}, ${product_units.base_price}, ${products.offer_price}, ${products.base_price}))`,
      max_price: sql<string>`MAX(COALESCE(${product_skus.offer_price}, ${product_skus.base_price}, ${product_units.offer_price}, ${product_units.base_price}, ${products.offer_price}, ${products.base_price}))`,
      currency: sql<string>`COALESCE(MAX(${product_skus.currency}), MAX(${products.currency}), 'DZD')`,
    })
    .from(products)
    .leftJoin(
      product_units,
      and(eq(product_units.product_id, products.id), eq(product_units.channel, "retail")),
    )
    .leftJoin(
      product_skus,
      and(eq(product_skus.product_id, products.id), eq(product_skus.is_active, true)),
    )
    .where(eq(products.id, product_id))
    .limit(1);

  // Wholesale price range from SKUs
  const [wholesale_row] = await db
    .select({
      min_price: sql<string>`MIN(COALESCE(${product_skus.wholesale_offer_price}, ${product_skus.wholesale_base_price}, ${product_units.offer_price}, ${product_units.base_price}, ${products.offer_price}, ${products.base_price}))`,
      max_price: sql<string>`MAX(COALESCE(${product_skus.wholesale_offer_price}, ${product_skus.wholesale_base_price}, ${product_units.offer_price}, ${product_units.base_price}, ${products.offer_price}, ${products.base_price}))`,
      currency: sql<string>`COALESCE(MAX(${product_skus.currency}), MAX(${products.currency}), 'DZD')`,
    })
    .from(products)
    .leftJoin(
      product_units,
      and(eq(product_units.product_id, products.id), eq(product_units.channel, "wholesale")),
    )
    .leftJoin(
      product_skus,
      and(eq(product_skus.product_id, products.id), eq(product_skus.is_active, true)),
    )
    .where(eq(products.id, product_id))
    .limit(1);

  return {
    retail: {
      min_price: retail_row?.min_price ?? "0.00",
      max_price: retail_row?.max_price ?? "0.00",
      currency: retail_row?.currency ?? retail_unit?.currency ?? "DZD",
    },
    wholesale: {
      min_price: wholesale_row?.min_price ?? "0.00",
      max_price: wholesale_row?.max_price ?? "0.00",
      currency: wholesale_row?.currency ?? wholesale_unit?.currency ?? "DZD",
    },
  };
}
