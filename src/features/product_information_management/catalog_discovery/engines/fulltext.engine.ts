import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import {
  products,
  product_translations,
} from "@/features/product_information_management/products/schema";
import { brands } from "@/features/product_information_management/brands/schema";
import { and, eq } from "drizzle-orm";
import { CATALOG_CACHE, CATALOG_CACHE_TTL } from "../constants/cache-keys";

export function to_boolean_fulltext_query(q: string): string | null {
  const tokens = q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter((t) => t.length >= 2);

  if (!tokens.length) return null;
  return tokens.map((t) => `+${t}*`).join(" ");
}

export class FulltextEngine {
  async search_product_ids(locale: string, q: string, limit = 800) {
    const cache_key = CATALOG_CACHE.fulltext(locale, q);
    const cached = await redis.get(cache_key);
    if (cached) {
      const parsed = JSON.parse(cached) as { ids: string[]; scores: [string, number][] };
      return { ids: parsed.ids, scores: new Map<string, number>(parsed.scores) };
    }

    const boolean_q = to_boolean_fulltext_query(q);
    if (!boolean_q) return { ids: [] as string[], scores: new Map<string, number>() };

    const rows = await db
      .select({
        product_id: products.id,
        score:
          sql<number>`(
            MATCH(${product_translations.name}, ${product_translations.keywords}, ${product_translations.description}) AGAINST (${boolean_q} IN BOOLEAN MODE) * 2.0
            +
            COALESCE(MATCH(${brands.name}) AGAINST (${boolean_q} IN BOOLEAN MODE), 0) * 1.5
          )`.as("score"),
      })
      .from(products)
      .innerJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, locale),
        ),
      )
      .leftJoin(brands, eq(brands.id, products.brand_id))
      .where(
        and(
          eq(products.status, "published"),
          sql`(
            MATCH(${product_translations.name}, ${product_translations.keywords}, ${product_translations.description}) AGAINST (${boolean_q} IN BOOLEAN MODE)
            OR (${brands.id} IS NOT NULL AND MATCH(${brands.name}) AGAINST (${boolean_q} IN BOOLEAN MODE))
          )`,
        ),
      )
      .orderBy(sql`score DESC`)
      .limit(limit);

    const scores = new Map<string, number>();
    for (const row of rows) scores.set(row.product_id, Number(row.score ?? 0));
    const result = { ids: rows.map((r) => r.product_id), scores };

    await redis.set(
      cache_key,
      JSON.stringify({ ids: result.ids, scores: [...scores.entries()] }),
      "EX",
      CATALOG_CACHE_TTL.fulltext,
    );

    return result;
  }
}

export const fulltext_engine = new FulltextEngine();
