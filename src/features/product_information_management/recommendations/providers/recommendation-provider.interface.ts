import type { RecommendationContext, RecommendationItem } from "../types";

export interface RecommendationProvider {
  readonly name: string;
  get_similar(product_id: string, ctx: RecommendationContext): Promise<RecommendationItem[]>;
  get_related(product_id: string, ctx: RecommendationContext): Promise<RecommendationItem[]>;
  get_frequently_bought_together(
    product_id: string,
    ctx: RecommendationContext,
  ): Promise<RecommendationItem[]>;
  get_trending(
    ctx: RecommendationContext & { period: "day" | "week" },
  ): Promise<RecommendationItem[]>;
  get_for_you(ctx: RecommendationContext & { user_id: string }): Promise<RecommendationItem[]>;
}
