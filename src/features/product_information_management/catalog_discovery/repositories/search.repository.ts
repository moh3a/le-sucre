import "server-only";

import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  products,
  product_translations,
  brands,
} from "@/features/product_information_management/products/schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import type {
  ResolvedCatalogFilters,
  CatalogProductCard,
  CatalogSearchMeta,
  CatalogSort,
} from "../types";
import { catalog_order_by, effective_list_price_sql } from "../engines/sort.engine";

export class SearchRepository {
  public build_where(filters: ResolvedCatalogFilters) {
    const clauses = [eq(products.status, "published")];

    if (filters.category_ids?.length) {
      clauses.push(inArray(products.category_id, filters.category_ids));
    }
    if (filters.brand_ids?.length) {
      clauses.push(inArray(products.brand_id, filters.brand_ids));
    }
    if (filters.is_featured != null) {
      clauses.push(eq(products.is_featured, filters.is_featured));
    }
    if (filters.fulltext_product_ids) {
      if (!filters.fulltext_product_ids.length) {
        return sql`1 = 0`;
      }
      clauses.push(inArray(products.id, filters.fulltext_product_ids));
    }
    if (filters.price_min != null) {
      clauses.push(sql`${effective_list_price_sql} >= ${filters.price_min}`);
    }
    if (filters.price_max != null) {
      clauses.push(sql`${effective_list_price_sql} <= ${filters.price_max}`);
    }
    if (filters.in_stock_only) {
      clauses.push(sql`(
        ${products.has_variants} = 0
        OR EXISTS (
          SELECT 1 FROM product_skus ps
          WHERE ps.product_id = ${products.id}
            AND ps.is_active = 1
            AND ps.stock_available > 0
        )
      )`);
    }

    return and(...clauses);
  }

  async search(
    filters: ResolvedCatalogFilters,
    sort: CatalogSort,
    page: number,
    limit: number,
  ): Promise<{ items: CatalogProductCard[]; meta: CatalogSearchMeta }> {
    const where = this.build_where(filters);
    const offset = (page - 1) * limit;
    const has_query = Boolean(filters.fulltext_scores?.size);

    const relevance_score = has_query
      ? sql<number>`CASE ${products.id}
          ${sql.join(
            [...(filters.fulltext_scores?.entries() ?? [])].map(
              ([id, score]) => sql`WHEN ${id} THEN ${score}`,
            ),
            sql` `,
          )}
          ELSE 0 END`.as("relevance_score")
      : sql<number>`0`.as("relevance_score");

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: products.id,
          slug: products.slug,
          currency: products.currency,
          is_featured: products.is_featured,
          name: product_translations.name,
          brand_name: brands.name,
          min_price: effective_list_price_sql,
          max_price: sql<string | null>`(
            SELECT MAX(COALESCE(ps.offer_price, ps.base_price))
            FROM product_skus ps
            WHERE ps.product_id = ${products.id} AND ps.is_active = 1
          )`,
          image_url: sql<string | null>`(
            SELECT pm.url FROM product_media pm
            WHERE pm.product_id = ${products.id}
            ORDER BY pm.is_primary DESC, pm.sort_order ASC
            LIMIT 1
          )`,
          in_stock: sql<number>`CASE WHEN ${products.has_variants} = 0 THEN 1 ELSE (
            SELECT MAX(ps.stock_available) FROM product_skus ps
            WHERE ps.product_id = ${products.id} AND ps.is_active = 1
          ) END`,
          relevance_score,
        })
        .from(products)
        .innerJoin(
          product_translations,
          and(
            eq(product_translations.product_id, products.id),
            eq(product_translations.locale, filters.locale),
          ),
        )
        .leftJoin(brands, eq(brands.id, products.brand_id))
        .where(where)
        .orderBy(...catalog_order_by(sort, has_query))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(products).where(where),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.max(1, Math.ceil(total_records / limit));

    return {
      items: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        image_url: r.image_url,
        currency: r.currency,
        min_price: String(r.min_price),
        max_price: r.max_price != null ? String(r.max_price) : null,
        is_featured: r.is_featured,
        in_stock: Number(r.in_stock) > 0,
        brand_name: r.brand_name,
        relevance_score: Number(r.relevance_score ?? 0),
      })),
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }

  async facets(filters: ResolvedCatalogFilters) {
    const where = this.build_where(filters);

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
        property_code: sql<string>`pp.code`,
        property_name: sql<string>`pp.name`,
        value_code: sql<string>`pv.code`,
        value_label: sql<string>`pv.label`,
        count: sql<number>`COUNT(DISTINCT p.id)`.mapWith(Number),
      })
      .from(sql`${products} p`)
      .innerJoin(product_skus, sql`ps.product_id = p.id AND ps.is_active = 1`)
      .innerJoin(sql`sku_option_values sov`, sql`sov.sku_id = ps.id`)
      .innerJoin(sql`property_values pv`, sql`pv.id = sov.property_value_id`)
      .innerJoin(sql`product_properties pp`, sql`pp.id = pv.property_id AND pp.product_id = p.id`)
      .where(where)
      .groupBy(sql`pp.code`, sql`pp.name`, sql`pv.code`, sql`pv.label`)
      .orderBy(sql`pp.code`, desc(sql`COUNT(DISTINCT p.id)`))
      .limit(200);

    // NOTE: if raw sql aliases fail in drizzle, use explicit imports instead of sql`${products} p`
    // Fallback facet property query is in search.service (simpler join) — see service below.

    return {
      brands: brand_rows,
      price: { min: price_row?.min ?? 0, max: price_row?.max ?? 0 },
      properties: property_rows,
    };
  }
}

export const search_repository = new SearchRepository();
