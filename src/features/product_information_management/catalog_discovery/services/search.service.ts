// TODO: Refactor tip: change build_where on SearchRepository to public build_where(...) instead of bracket access.
import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { products, brands } from "@/features/product_information_management/products/schema";
import {
  product_properties,
  property_values,
  product_skus,
  sku_option_values,
} from "@/features/product_information_management/variants/schema";

import type { catalog_facets_dto, catalog_search_dto } from "../models/search.dto";
import { stable_catalog_hash, catalog_search_cache_payload } from "../helpers/query-key.helper";
import { filtering_engine } from "../engines/filtering.engine";
import { search_repository } from "../repositories/search.repository";
import { search_cache_service, CATALOG_CACHE, CATALOG_CACHE_TTL } from "./search-cache.service";
import type { CatalogFacets } from "../types";
import { effective_list_price_sql } from "../engines/sort.engine";

export class SearchService {
  async search(input: z.infer<typeof catalog_search_dto>) {
    const hash = stable_catalog_hash(catalog_search_cache_payload(input));
    const cache_key = CATALOG_CACHE.search(hash);

    const cached =
      await search_cache_service.get<Awaited<ReturnType<typeof search_repository.search>>>(
        cache_key,
      );
    if (cached) return { ...cached, cached: true as const };

    const filters = await filtering_engine.resolve(input);
    const result = await search_repository.search(filters, input.sort, input.page, input.limit);

    await search_cache_service.set(cache_key, result, CATALOG_CACHE_TTL.search);
    return { ...result, cached: false as const };
  }

  async facets(input: z.infer<typeof catalog_facets_dto>): Promise<CatalogFacets> {
    const hash = stable_catalog_hash(input);
    const cache_key = CATALOG_CACHE.facets(hash);

    const cached = await search_cache_service.get<CatalogFacets>(cache_key);
    if (cached) return cached;

    const filters = await filtering_engine.resolve({
      ...input,
      page: 1,
      limit: 1,
      sort: "relevance",
    });

    const where = search_repository.build_where(filters);

    const brand_rows = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(products)
      .innerJoin(brands, eq(brands.id, products.brand_id))
      .where(where)
      .groupBy(brands.id, brands.name, brands.slug)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(40);

    const [price_row] = await db
      .select({
        min: sql<number>`MIN(${effective_list_price_sql})`.mapWith(Number),
        max: sql<number>`MAX(${effective_list_price_sql})`.mapWith(Number),
      })
      .from(products)
      .where(where);

    const property_rows = await db
      .select({
        property_code: product_properties.code,
        property_name: product_properties.name,
        value_code: property_values.code,
        value_label: property_values.label,
        count: sql<number>`COUNT(DISTINCT ${products.id})`.mapWith(Number),
      })
      .from(products)
      .innerJoin(product_skus, eq(product_skus.product_id, products.id))
      .innerJoin(sku_option_values, eq(sku_option_values.sku_id, product_skus.id))
      .innerJoin(property_values, eq(property_values.id, sku_option_values.property_value_id))
      .innerJoin(product_properties, eq(product_properties.id, property_values.property_id))
      .where(and(where, eq(product_skus.is_active, true)))
      .groupBy(
        product_properties.code,
        product_properties.name,
        property_values.code,
        property_values.label,
      )
      .orderBy(product_properties.code, desc(sql`COUNT(DISTINCT ${products.id})`))
      .limit(200);

    const prop_map = new Map<string, CatalogFacets["properties"][0]>();
    for (const row of property_rows) {
      if (!prop_map.has(row.property_code)) {
        prop_map.set(row.property_code, {
          code: row.property_code,
          name: row.property_name,
          values: [],
        });
      }
      prop_map.get(row.property_code)!.values.push({
        code: row.value_code,
        label: row.value_label,
        count: row.count,
      });
    }

    const facets: CatalogFacets = {
      brands: brand_rows.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        count: b.count,
      })),
      price: { min: price_row?.min ?? 0, max: price_row?.max ?? 0 },
      properties: [...prop_map.values()],
    };

    await search_cache_service.set(cache_key, facets, CATALOG_CACHE_TTL.facets);
    return facets;
  }
}

export const search_service = new SearchService();
