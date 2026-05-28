import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { category_cache_service } from "@/features/product_information_management/categories/services/category-cache.service";
import { CATALOG_CACHE, CATALOG_CACHE_TTL } from "../constants/cache-keys";
import { categories } from "@/features/product_information_management/categories/schema";
import {
  product_properties,
  property_values,
  product_skus,
  sku_option_values,
} from "@/features/product_information_management/variants/schema";
import type { CatalogSearchInput } from "../models/search.dto";
import type { ResolvedCatalogFilters } from "../types";
import { fulltext_engine } from "./fulltext.engine";

export class FilteringEngine {
  async resolve_category_ids(input: CatalogSearchInput) {
    if (input.category_id) {
      const cache_key = CATALOG_CACHE.category_ids(input.category_id);
      const cached = await category_cache_service.get<string[]>(cache_key);
      if (cached) return cached;

      const ids = await category_service.resolve_filter_ids(
        input.category_id,
        input.include_descendants,
      );
      await category_cache_service.set(cache_key, ids, CATALOG_CACHE_TTL.category_ids);
      return ids;
    }

    if (input.category_slug) {
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.slug, input.category_slug), eq(categories.is_active, true)))
        .limit(1);
      if (!cat) return [];
      return category_service.resolve_filter_ids(cat.id, input.include_descendants);
    }

    return undefined;
  }

  /** SKUs matching ALL property axes (variant filtering) */
  async resolve_variant_product_ids(
    property_filters: Array<{ property_code: string; value_codes: string[] }>,
  ) {
    if (!property_filters.length) return undefined;

    const filter_count = property_filters.length;

    const or_clauses = property_filters.map(
      (f) =>
        sql`(${eq(product_properties.code, f.property_code)} AND ${inArray(property_values.code, f.value_codes)})`,
    );

    const rows = await db
      .select({ product_id: product_skus.product_id })
      .from(product_skus)
      .innerJoin(sku_option_values, eq(sku_option_values.sku_id, product_skus.id))
      .innerJoin(property_values, eq(property_values.id, sku_option_values.property_value_id))
      .innerJoin(product_properties, eq(product_properties.id, property_values.property_id))
      .where(and(eq(product_skus.is_active, true), sql`(${sql.join(or_clauses, sql` OR `)})`))
      .groupBy(product_skus.id, product_skus.product_id)
      .having(sql`COUNT(DISTINCT ${product_properties.code}) = ${filter_count}`);

    return [...new Set(rows.map((r) => r.product_id))];
  }

  async resolve(input: CatalogSearchInput): Promise<ResolvedCatalogFilters> {
    const category_ids = await this.resolve_category_ids(input);

    const property_filters = input.properties
      ? Object.entries(input.properties).map(([property_code, value_codes]) => ({
          property_code,
          value_codes,
        }))
      : [];

    let fulltext_product_ids: string[] | undefined;
    let fulltext_scores: Map<string, number> | undefined;

    if (input.q?.trim()) {
      const ft = await fulltext_engine.search_product_ids(input.locale, input.q.trim());
      fulltext_product_ids = ft.ids;
      fulltext_scores = ft.scores;
    }

    let variant_product_ids: string[] | undefined;
    if (property_filters.length) {
      variant_product_ids = await this.resolve_variant_product_ids(property_filters);
    }

    let intersect_ids: string[] | undefined;
    const pools = [fulltext_product_ids, variant_product_ids].filter(Boolean) as string[][];
    if (pools.length === 1) intersect_ids = pools[0];
    if (pools.length === 2) {
      const set = new Set(pools[0]);
      intersect_ids = pools[1].filter((id) => set.has(id));
    }

    return {
      locale: input.locale,
      category_ids,
      brand_ids: input.brand_ids,
      price_min: input.price_min,
      price_max: input.price_max,
      property_filters,
      in_stock_only: input.in_stock_only,
      is_featured: input.is_featured,
      fulltext_product_ids: intersect_ids,
      fulltext_scores,
    };
  }
}

export const filtering_engine = new FilteringEngine();
