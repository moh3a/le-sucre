import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  products,
  product_translations,
} from "@/features/product_information_management/products/schema";
import { brands } from "@/features/product_information_management/brands/schema";
import { categories } from "@/features/product_information_management/categories/schema";
import { redis } from "@/lib/redis";
import { CATALOG_CACHE, CATALOG_CACHE_TTL } from "../constants/cache-keys";
import type { SearchSuggestion, TrendingSearchTerm } from "../types";

export class SuggestionsEngine {
  async search_suggestions(
    locale: string,
    q: string,
    limit = 10,
  ): Promise<SearchSuggestion[]> {
    const cache_key = CATALOG_CACHE.suggestions(locale, q);
    const cached = await redis.get(cache_key);
    if (cached) return JSON.parse(cached) as SearchSuggestion[];

    const token = q.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").slice(0, 100);
    if (token.length < 1) return [];

    const prefix = `${token}%`;

    const [product_rows, brand_rows, category_rows] = await Promise.all([
      db
        .select({
          text: product_translations.name,
          slug: products.slug,
          image_url: sql<string | null>`(
            SELECT pm.url FROM product_media pm
            WHERE pm.product_id = ${products.id}
            ORDER BY pm.is_primary DESC, pm.sort_order ASC
            LIMIT 1
          )`,
        })
        .from(product_translations)
        .innerJoin(products, eq(products.id, product_translations.product_id))
        .where(
          and(
            eq(product_translations.locale, locale),
            eq(products.status, "published"),
            sql`${product_translations.name} LIKE ${prefix}`,
          ),
        )
        .limit(Math.ceil(limit * 0.5)),

      db
        .select({ text: brands.name, slug: brands.slug })
        .from(brands)
        .where(and(eq(brands.is_active, true), sql`${brands.name} LIKE ${prefix}`))
        .limit(Math.ceil(limit * 0.3)),

      db
        .select({ text: categories.name, slug: categories.slug })
        .from(categories)
        .where(and(eq(categories.is_active, true), sql`${categories.name} LIKE ${prefix}`))
        .limit(Math.ceil(limit * 0.2)),
    ]);

    const suggestions: SearchSuggestion[] = [
      ...product_rows.map((r) => ({
        type: "product" as const,
        text: r.text,
        slug: r.slug,
        image_url: r.image_url,
      })),
      ...brand_rows.map((r) => ({
        type: "brand" as const,
        text: r.text,
        slug: r.slug,
        image_url: null,
      })),
      ...category_rows.map((r) => ({
        type: "category" as const,
        text: r.text,
        slug: r.slug,
        image_url: null,
      })),
    ];

    const result = suggestions.slice(0, limit);
    await redis.set(cache_key, JSON.stringify(result), "EX", CATALOG_CACHE_TTL.suggestions);
    return result;
  }

  async trending_searches(locale: string, limit = 10): Promise<TrendingSearchTerm[]> {
    const cache_key = CATALOG_CACHE.trending(locale);
    const cached = await redis.get(cache_key);
    if (cached) return JSON.parse(cached) as TrendingSearchTerm[];

    const results = await redis.zrevrange(
      `catalog:trending:raw:${locale}`,
      0,
      limit - 1,
      "WITHSCORES",
    );

    const trending: TrendingSearchTerm[] = [];
    for (let i = 0; i < results.length; i += 2) {
      trending.push({
        query: results[i] as string,
        locale,
        count: Number(results[i + 1] as string),
      });
    }

    await redis.set(cache_key, JSON.stringify(trending), "EX", CATALOG_CACHE_TTL.trending);
    return trending;
  }

  async track_search(query: string, locale: string) {
    const key = `catalog:trending:raw:${locale}`;
    await redis.zincrby(key, 1, query.trim().toLowerCase());
    await redis.expire(key, 60 * 60 * 48);
  }
}

export const suggestions_engine = new SuggestionsEngine();
