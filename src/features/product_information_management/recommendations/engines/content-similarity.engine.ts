// engines/content-similarity.engine.ts
import "server-only";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  product_translations,
} from "@/features/product_information_management/products/schema";
import { categories } from "@/features/product_information_management/categories/schema";
import { SCORING_WEIGHTS } from "../constants/scoring-weights";
import {
  merge_candidate_scores,
  normalize_candidates,
  keyword_overlap_score,
  price_proximity_score,
  tag_overlap_score,
  tokenize_keywords,
} from "./scoring.engine";
import type { ScoredCandidate } from "../types";

type SourceProduct = {
  id: string;
  category_id: string;
  brand_id: string | null;
  base_price: string;
  offer_price: string | null;
  seo_keywords: string | null;
  metadata: Record<string, unknown> | null;
  name: string;
  category_path: string;
};

function extract_tags(p: SourceProduct) {
  const meta_tags = Array.isArray(p.metadata?.tags) ? (p.metadata!.tags as string[]) : [];
  const seo =
    p.seo_keywords
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  return [...meta_tags, ...seo];
}

export async function build_content_candidates(
  source: SourceProduct,
  related_category_ids: string[],
  limit = 80,
): Promise<ScoredCandidate[]> {
  const map = new Map<string, ScoredCandidate>();
  const source_price = Number(source.offer_price ?? source.base_price);
  const source_keywords = tokenize_keywords(`${source.name} ${source.seo_keywords ?? ""}`);
  const source_tags = extract_tags(source);

  const candidates = await db
    .select({
      id: products.id,
      category_id: products.category_id,
      brand_id: products.brand_id,
      base_price: products.base_price,
      offer_price: products.offer_price,
      seo_keywords: products.seo_keywords,
      metadata: products.metadata,
      name: product_translations.name,
    })
    .from(products)
    .innerJoin(
      product_translations,
      and(
        eq(product_translations.product_id, products.id),
        eq(product_translations.locale, "fr"), // caller can pass locale in service layer
      ),
    )
    .where(
      and(
        eq(products.status, "published"),
        ne(products.id, source.id),
        inArray(products.category_id, related_category_ids),
      ),
    )
    .limit(limit);

  for (const c of candidates) {
    if (c.category_id === source.category_id) {
      merge_candidate_scores(map, c.id, SCORING_WEIGHTS.same_category, "same_category");
    } else {
      merge_candidate_scores(map, c.id, SCORING_WEIGHTS.related_category, "related_category");
    }
    if (source.brand_id && c.brand_id === source.brand_id) {
      merge_candidate_scores(map, c.id, SCORING_WEIGHTS.same_brand, "same_brand");
    }
    const candidate_price = Number(c.offer_price ?? c.base_price);
    const price_score = price_proximity_score(source_price, candidate_price);
    if (price_score) merge_candidate_scores(map, c.id, price_score, "price_proximity");

    const kw = keyword_overlap_score(
      source_keywords,
      tokenize_keywords(`${c.name} ${c.seo_keywords ?? ""}`),
    );
    if (kw) merge_candidate_scores(map, c.id, kw, "keyword_overlap");

    const tag_score = tag_overlap_score(source_tags, extract_tags(c as SourceProduct));
    if (tag_score) merge_candidate_scores(map, c.id, tag_score, "tag_overlap");
  }

  // Shared property values via SKU junction
  const shared_property_rows = await db.execute(sql`
    SELECT DISTINCT p2.id AS product_id, COUNT(*) AS shared_values
    FROM product_skus ps1
    INNER JOIN sku_option_values sov1 ON sov1.sku_id = ps1.id
    INNER JOIN sku_option_values sov2 ON sov2.property_value_id = sov1.property_value_id
    INNER JOIN product_skus ps2 ON ps2.id = sov2.sku_id
    INNER JOIN products p2 ON p2.id = ps2.product_id
    WHERE ps1.product_id = ${source.id}
      AND ps2.product_id <> ${source.id}
      AND ps1.is_active = 1 AND ps2.is_active = 1
      AND p2.status = 'published'
    GROUP BY p2.id
    ORDER BY shared_values DESC
    LIMIT 40
  `);

  for (const row of shared_property_rows[0] as unknown as Array<{
    product_id: string;
    shared_values: number;
  }>) {
    const partial =
      Math.min(1, Number(row.shared_values) / 3) * SCORING_WEIGHTS.shared_property_values;
    merge_candidate_scores(map, row.product_id, partial, "shared_property_values");
  }

  return normalize_candidates([...map.values()], source.id);
}

export async function load_source_product(product_id: string, locale: string) {
  const [row] = await db
    .select({
      id: products.id,
      category_id: products.category_id,
      brand_id: products.brand_id,
      base_price: products.base_price,
      offer_price: products.offer_price,
      seo_keywords: products.seo_keywords,
      metadata: products.metadata,
      name: product_translations.name,
      category_path: categories.path,
    })
    .from(products)
    .innerJoin(
      product_translations,
      and(
        eq(product_translations.product_id, products.id),
        eq(product_translations.locale, locale),
      ),
    )
    .innerJoin(categories, eq(categories.id, products.category_id))
    .where(eq(products.id, product_id))
    .limit(1);
  return row ?? null;
}

/** Related categories = same parent subtree via materialized path prefix */
export async function resolve_related_category_ids(category_path: string) {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.is_active, true), sql`${categories.path} LIKE ${`${category_path}%`}`))
    .limit(200);
  return rows.map((r) => r.id);
}
