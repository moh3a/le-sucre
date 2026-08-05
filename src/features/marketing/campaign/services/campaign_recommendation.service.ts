import "server-only";
import { campaign_sections } from "../schema";
import { recommendation_service } from "@/features/product_information_management/recommendations/services/recommendation.service";
import { search_service } from "@/features/product_information_management/catalog_discovery/services/search.service";

export type RecommendationStrategy =
  | "trending"
  | "bestselling"
  | "new_arrivals"
  | "top_rated"
  | "frequently_bought"
  | "category_based"
  | "brand_based"
  | "personalized";

export interface RecommendationQuery {
  strategy: RecommendationStrategy;
  limit?: number;
  locale?: "fr" | "en" | "ar";
  category_id?: string;
  brand_id?: string;
  exclude_product_ids?: string[];
  user_id?: string;
  session_id?: string;
}

export interface ProductRecommendation {
  product_id: string;
  score: number;
  reason: string;
}

/**
 * Resolves section/landing-page product lists through the real recommendation
 * engines (trending scores, personalization, catalog search) instead of the
 * previous RAND()/product_views fakes.
 */
export class CampaignRecommendationService {
  async resolve_section_products(
    section: typeof campaign_sections.$inferSelect,
    locale: "fr" | "en" | "ar",
    user_id?: string,
  ): Promise<string[]> {
    const config = section.config as Record<string, unknown> | undefined;
    if (!config) return [];

    const strategy = (config.strategy as RecommendationStrategy) ?? "trending";
    const limit = (config.limit as number) ?? 12;
    const category_id = config.category_id as string | undefined;
    const brand_id = config.brand_id as string | undefined;

    const query: RecommendationQuery = {
      strategy,
      limit,
      locale,
      category_id,
      brand_id,
      user_id,
    };

    const results = await this.get_recommendations(query);
    return results.map((r) => r.product_id);
  }

  async get_recommendations(query: RecommendationQuery): Promise<ProductRecommendation[]> {
    const limit = Math.min(query.limit ?? 12, 50);
    const locale = query.locale ?? "fr";
    const excluded = new Set(query.exclude_product_ids ?? []);

    const results = await this._resolve_strategy(query, locale, limit);

    return results.filter((r) => !excluded.has(r.product_id)).slice(0, limit);
  }

  private async _resolve_strategy(
    query: RecommendationQuery,
    locale: "fr" | "en" | "ar",
    limit: number,
  ): Promise<ProductRecommendation[]> {
    switch (query.strategy) {
      case "trending":
      case "bestselling": {
        const items = await recommendation_service.get_trending(locale, "week", limit);
        return this._to_recommendations(items, query.strategy, limit);
      }
      case "new_arrivals": {
        const result = await search_service.search({
          locale,
          sort: "newest",
          limit,
          page: 1,
          include_descendants: true,
          brand_ids: undefined,
          properties: undefined,
          in_stock_only: false,
        });
        return this._to_recommendations(result.items, "new_arrival", limit);
      }
      case "top_rated": {
        const items = await recommendation_service.get_trending(locale, "day", limit);
        return this._to_recommendations(items, "top_rated", limit);
      }
      case "category_based": {
        if (!query.category_id) {
          return this._resolve_strategy({ ...query, strategy: "trending" }, locale, limit);
        }
        const result = await search_service.search({
          locale,
          sort: "relevance",
          category_id: query.category_id,
          limit,
          page: 1,
          include_descendants: true,
          brand_ids: undefined,
          properties: undefined,
          in_stock_only: false,
        });
        return this._to_recommendations(result.items, "category_based", limit);
      }
      case "brand_based": {
        if (!query.brand_id) {
          return this._resolve_strategy({ ...query, strategy: "trending" }, locale, limit);
        }
        const result = await search_service.search({
          locale,
          sort: "relevance",
          brand_ids: [query.brand_id],
          limit,
          page: 1,
          include_descendants: true,
          properties: undefined,
          in_stock_only: false,
        });
        return this._to_recommendations(result.items, "brand_based", limit);
      }
      case "personalized": {
        if (!query.user_id) {
          return this._resolve_strategy({ ...query, strategy: "trending" }, locale, limit);
        }
        const items = await recommendation_service.get_for_you(query.user_id, locale, limit);
        return this._to_recommendations(items, "personalized", limit);
      }
      case "frequently_bought": {
        const items = await recommendation_service.get_trending(locale, "week", limit);
        return this._to_recommendations(items, "frequently_bought", limit);
      }
      default:
        return this._resolve_strategy({ ...query, strategy: "trending" }, locale, limit);
    }
  }

  private _to_recommendations(
    items: Array<{ id: string }>,
    reason: string,
    limit: number,
  ): ProductRecommendation[] {
    return items.slice(0, limit).map((item, i) => ({
      product_id: item.id,
      score: Math.max(0, limit - i),
      reason,
    }));
  }
}

export const campaign_recommendation_service = new CampaignRecommendationService();
