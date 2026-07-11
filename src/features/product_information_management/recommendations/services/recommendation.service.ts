import "server-only";
import { search_repository } from "@/features/product_information_management/catalog_discovery/repositories/search.repository";
import { get_recommendation_provider } from "../providers/provider-registry";
import type { RecommendationContext, RecommendationItem } from "../types";
import { recommendation_cache_service } from "./recommendation-cache.service";
import { RECOMMENDATION_CACHE } from "../constants/cache-keys";
import { tryFn } from "@/lib/error_handling";

export class RecommendationService {
  private provider = get_recommendation_provider();

  private async hydrate_cards(
    locale: string,
    scored: Array<{ product_id: string; score: number; recommendation_type: string }>,
  ): Promise<RecommendationItem[]> {
    if (!scored.length) return [];
    const ids = scored.map((s) => s.product_id);
    const [err, result] = await tryFn(
      search_repository.search(
        { locale, fulltext_product_ids: ids, in_stock_only: true, property_filters: [] },
        "featured",
        1,
        ids.length,
      ),
    );
    if (err || !result) return [];
    const by_id = new Map(result.items.map((c) => [c.id, c]));
    return scored
      .map((s) => {
        const card = by_id.get(s.product_id);
        if (!card) return null;
        return { ...card, score: s.score, recommendation_type: s.recommendation_type };
      })
      .filter(Boolean) as RecommendationItem[];
  }

  async get_product_recommendations(input: {
    product_id: string;
    locale: string;
    types: string[];
    limit: number;
  }) {
    const ctx: RecommendationContext = { locale: input.locale, limit: input.limit };
    const result: Record<string, RecommendationItem[]> = {};

    for (const type of input.types) {
      const cache_key =
        type === "fbt"
          ? RECOMMENDATION_CACHE.fbt(input.product_id, input.locale)
          : type === "related"
            ? RECOMMENDATION_CACHE.related(input.product_id, input.locale)
            : RECOMMENDATION_CACHE.similar(input.product_id, input.locale);

      const [cache_err, cached] = await tryFn(
        recommendation_cache_service.get<RecommendationItem[]>(cache_key),
      );
      if (!cache_err && cached) {
        result[type] = cached;
        continue;
      }

      let items: RecommendationItem[] = [];
      if (type === "fbt")
        items = await this.provider.get_frequently_bought_together(input.product_id, ctx);
      else if (type === "related") items = await this.provider.get_related(input.product_id, ctx);
      else items = await this.provider.get_similar(input.product_id, ctx);

      const [set_err] = await tryFn(recommendation_cache_service.set(cache_key, items));
      void set_err;
      result[type] = items;
    }

    return result;
  }

  async get_trending(locale: string, period: "day" | "week", limit: number) {
    const cache_key = RECOMMENDATION_CACHE.trending(period, locale);
    const [cache_err, cached] = await tryFn(
      recommendation_cache_service.get<RecommendationItem[]>(cache_key),
    );
    if (!cache_err && cached) return cached;
    const items = await this.provider.get_trending({ locale, limit, period });
    const [set_err] = await tryFn(recommendation_cache_service.set(cache_key, items));
    void set_err;
    return items;
  }

  async get_for_you(user_id: string, locale: string, limit: number) {
    const cache_key = RECOMMENDATION_CACHE.for_you(user_id, locale);
    const [cache_err, cached] = await tryFn(
      recommendation_cache_service.get<RecommendationItem[]>(cache_key),
    );
    if (!cache_err && cached) return cached;
    const items = await this.provider.get_for_you({ locale, limit, user_id });
    const [set_err] = await tryFn(recommendation_cache_service.set(cache_key, items));
    void set_err;
    return items;
  }

  async hydrate_ids(locale: string, ids: string[]) {
    if (!ids.length) return [];
    const [err, result] = await tryFn(
      search_repository.search(
        { locale, fulltext_product_ids: ids, in_stock_only: false, property_filters: [] },
        "featured",
        1,
        ids.length,
      ),
    );
    if (err || !result) return [];
    const by_id = new Map(result.items.map((c) => [c.id, c]));
    return ids
      .map((id) => {
        const card = by_id.get(id);
        if (!card) return null;
        return { ...card, score: 1, recommendation_type: "recent" };
      })
      .filter(Boolean) as RecommendationItem[];
  }
}
export const recommendation_service = new RecommendationService();
