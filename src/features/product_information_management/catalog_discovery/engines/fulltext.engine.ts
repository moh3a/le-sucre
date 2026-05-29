import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  products,
  product_translations,
} from "@/features/product_information_management/products/schema";
import { and, eq } from "drizzle-orm";

/** BOOLEAN MODE: +term* per token (Amazon/AliExpress-style prefix) */
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
    const boolean_q = to_boolean_fulltext_query(q);
    if (!boolean_q) return { ids: [] as string[], scores: new Map<string, number>() };

    const rows = await db
      .select({
        product_id: product_translations.product_id,
        score:
          sql<number>`MATCH(${product_translations.name}, ${product_translations.keywords}, ${product_translations.description}) AGAINST (${boolean_q} IN BOOLEAN MODE)`.as(
            "score",
          ),
      })
      .from(product_translations)
      .innerJoin(products, eq(products.id, product_translations.product_id))
      .where(
        and(
          eq(product_translations.locale, locale),
          eq(products.status, "published"),
          sql`MATCH(${product_translations.name}, ${product_translations.keywords}, ${product_translations.description}) AGAINST (${boolean_q} IN BOOLEAN MODE)`,
        ),
      )
      .orderBy(sql`score DESC`)
      .limit(limit);

    const scores = new Map<string, number>();
    for (const row of rows) scores.set(row.product_id, Number(row.score ?? 0));
    return { ids: rows.map((r) => r.product_id), scores };
  }
}

export const fulltext_engine = new FulltextEngine();
