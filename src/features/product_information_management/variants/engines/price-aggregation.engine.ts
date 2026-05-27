import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/features/product_information_management/products/schema";
import { product_skus } from "../schema";

export async function get_product_price_range(product_id: string): Promise<{
  min_price: string;
  max_price: string;
  currency: string;
}> {
  const [row] = await db
    .select({
      min_price: sql<string>`MIN(COALESCE(${product_skus.offer_price}, ${product_skus.base_price}, ${products.offer_price}, ${products.base_price}))`,
      max_price: sql<string>`MAX(COALESCE(${product_skus.offer_price}, ${product_skus.base_price}, ${products.offer_price}, ${products.base_price}))`,
      currency: sql<string>`COALESCE(MAX(${product_skus.currency}), MAX(${products.currency}), 'DZD')`,
    })
    .from(products)
    .leftJoin(
      product_skus,
      and(eq(product_skus.product_id, products.id), eq(product_skus.is_active, true)),
    )
    .where(eq(products.id, product_id))
    .limit(1);

  return {
    min_price: row?.min_price ?? "0.00",
    max_price: row?.max_price ?? "0.00",
    currency: row?.currency ?? "DZD",
  };
}
