import { sql } from "drizzle-orm";
import { desc, asc } from "drizzle-orm";
import { products } from "@/features/product_information_management/products/schema";
import type { CatalogSort } from "../types";

export const effective_list_price_sql = sql<string>`COALESCE(
  (
    SELECT MIN(COALESCE(${sql.raw("ps")}.offer_price, ${sql.raw("ps")}.base_price))
    FROM product_skus ps
    WHERE ps.product_id = ${products.id} AND ps.is_active = 1
  ),
  ${products.offer_price},
  ${products.base_price}
)`;

export function catalog_order_by(sort: CatalogSort, has_query: boolean) {
  switch (sort) {
    case "price_asc":
      return [asc(effective_list_price_sql), desc(products.created_at)];
    case "price_desc":
      return [desc(effective_list_price_sql), desc(products.created_at)];
    case "newest":
      return [desc(products.created_at)];
    case "featured":
      return [desc(products.is_featured), desc(products.created_at)];
    case "relevance":
    default:
      return has_query
        ? [sql`relevance_score DESC`, desc(products.is_featured)]
        : [desc(products.is_featured), desc(products.created_at)];
  }
}
