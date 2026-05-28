import { search_repository } from "@/features/catalog_discovery/repositories/search.repository";
import { RecommendationItem } from "../types";

export async function hydrate_recommendation_cards(
  locale: string,
  scored: Array<{ product_id: string; score: number; recommendation_type: string }>,
): Promise<RecommendationItem[]> {
  if (!scored.length) return [];
  const ids = scored.map((s) => s.product_id);
  const { items } = await search_repository.search(
    { locale, fulltext_product_ids: ids, in_stock_only: true, property_filters: [] },
    "featured",
    1,
    ids.length,
  );
  const by_id = new Map(items.map((c) => [c.id, c]));
  return scored
    .map((s) => {
      const card = by_id.get(s.product_id);
      if (!card) return null;
      return { ...card, score: s.score, recommendation_type: s.recommendation_type };
    })
    .filter(Boolean) as RecommendationItem[];
}
