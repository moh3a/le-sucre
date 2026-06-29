import "server-only";
import { db } from "@/lib/db";
import { eq, inArray, and, sql } from "drizzle-orm";
import { campaigns } from "../schema";
import { campaign_sections } from "../schema";
import { products } from "@/features/product_information_management/products/schema";

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

export class CampaignRecommendationService {
  async resolve_section_products(
    section: typeof campaign_sections.$inferSelect,
    locale: string,
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
      category_id,
      brand_id,
      user_id,
    };

    const results = await this.get_recommendations(query);
    return results.map((r) => r.product_id);
  }

  async get_recommendations(query: RecommendationQuery): Promise<ProductRecommendation[]> {
    const limit = Math.min(query.limit ?? 12, 50);

    switch (query.strategy) {
      case "trending":
        return this._get_trending(limit, query.category_id, query.brand_id);
      case "bestselling":
        return this._get_trending(limit, query.category_id, query.brand_id);
      case "new_arrivals":
        return this._get_new_arrivals(limit, query.category_id, query.brand_id);
      case "top_rated":
        return this._get_top_rated(limit, query.category_id, query.brand_id);
      case "category_based":
        return this._get_category_based(limit, query.category_id);
      case "brand_based":
        return this._get_brand_based(limit, query.brand_id);
      case "personalized":
        return this._get_personalized(limit, query.user_id);
      default:
        return this._get_trending(limit, query.category_id, query.brand_id);
    }
  }

  private async _get_trending(
    limit: number,
    category_id?: string,
    brand_id?: string,
  ): Promise<ProductRecommendation[]> {
    const clauses = [eq(products.status, "published")];
    if (category_id) clauses.push(eq(products.category_id, category_id));
    if (brand_id) clauses.push(eq(products.brand_id, brand_id));

    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(and(...clauses))
      .orderBy(sql`RAND()`)
      .limit(limit);

    return rows.map((r, i) => ({
      product_id: r.id,
      score: Math.max(0, limit - i),
      reason: "trending",
    }));
  }

  private async _get_new_arrivals(
    limit: number,
    category_id?: string,
    brand_id?: string,
  ): Promise<ProductRecommendation[]> {
    const clauses = [eq(products.status, "published")];
    if (category_id) clauses.push(eq(products.category_id, category_id));
    if (brand_id) clauses.push(eq(products.brand_id, brand_id));

    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(and(...clauses))
      .orderBy(sql`${products.created_at} DESC`)
      .limit(limit);

    return rows.map((r, i) => ({
      product_id: r.id,
      score: Math.max(0, limit - i),
      reason: "new_arrival",
    }));
  }

  private async _get_top_rated(
    limit: number,
    category_id?: string,
    brand_id?: string,
  ): Promise<ProductRecommendation[]> {
    return this._get_trending(limit, category_id, brand_id);
  }

  private async _get_category_based(
    limit: number,
    category_id?: string,
  ): Promise<ProductRecommendation[]> {
    if (!category_id) return this._get_trending(limit);
    return this._get_trending(limit, category_id);
  }

  private async _get_brand_based(
    limit: number,
    brand_id?: string,
  ): Promise<ProductRecommendation[]> {
    if (!brand_id) return this._get_trending(limit);
    return this._get_trending(limit, undefined, brand_id);
  }

  private async _get_personalized(
    limit: number,
    user_id?: string,
  ): Promise<ProductRecommendation[]> {
    if (!user_id) return this._get_trending(limit);

    const viewed_categories = await db
      .select({ category_id: products.category_id })
      .from(products)
      .innerJoin(
        sql`product_views`,
        eq(products.id, sql`product_views.product_id`),
      )
      .where(eq(sql`product_views.user_id`, user_id))
      .groupBy(products.category_id)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    if (!viewed_categories.length) return this._get_trending(limit);

    const category_ids = viewed_categories
      .map((r) => r.category_id)
      .filter(Boolean) as string[];

    if (!category_ids.length) return this._get_trending(limit);

    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.status, "published"),
          inArray(products.category_id, category_ids),
        ),
      )
      .orderBy(sql`RAND()`)
      .limit(limit);

    return rows.map((r, i) => ({
      product_id: r.id,
      score: Math.max(0, limit - i),
      reason: "personalized",
    }));
  }

  async get_flash_sale_products(
    campaign_id: string,
    limit = 20,
  ): Promise<string[]> {
    const campaign = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.id, campaign_id),
          eq(campaigns.campaign_type, "flash_sale"),
          eq(campaigns.status, "active"),
        ),
      )
      .limit(1);

    if (!campaign.length) return [];

    const sections = await db
      .select()
      .from(campaign_sections)
      .where(
        and(
          eq(campaign_sections.campaign_id, campaign_id),
          eq(campaign_sections.is_active, true),
        ),
      )
      .orderBy(sql`${campaign_sections.sort_order} ASC`);

    const product_ids: string[] = [];
    for (const section of sections) {
      const config = section.config as Record<string, unknown> | undefined;
      const ids = config?.product_ids as string[] | undefined;
      if (ids?.length) {
        product_ids.push(...ids.slice(0, limit - product_ids.length));
      }
      if (product_ids.length >= limit) break;
    }

    return product_ids.slice(0, limit);
  }
}

export const campaign_recommendation_service = new CampaignRecommendationService();
