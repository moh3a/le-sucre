import "server-only";
import { db } from "@/lib/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { campaigns, campaign_sections } from "../schema";
import { CAMPAIGN_TYPE, CAMPAIGN_STATUS } from "../constants/campaign_types";
import { campaign_recommendation_service } from "./campaign_recommendation.service";
import { campaign_cache } from "./campaign_cache.service";

export interface FlashSaleState {
  campaign_id: string;
  name: string;
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  time_remaining_seconds: number;
  is_active: boolean;
  is_ending_soon: boolean;
  product_ids: string[];
  theme: Record<string, unknown>;
}

export interface FlashSaleTimer {
  campaign_id: string;
  starts_at: string | null;
  ends_at: string | null;
  time_remaining_seconds: number;
  total_duration_seconds: number;
  elapsed_percentage: number;
  is_active: boolean;
  is_ending_soon: boolean;
}

export class CampaignFlashSaleService {
  async get_active_flash_sales(locale?: string): Promise<FlashSaleState[]> {
    const now = sql`NOW()`;

    const active = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.campaign_type, CAMPAIGN_TYPE.flash_sale),
          eq(campaigns.status, CAMPAIGN_STATUS.active),
          lte(campaigns.starts_at!, now),
          gte(campaigns.ends_at!, now),
        ),
      )
      .orderBy(sql`${campaigns.priority} ASC`);

    const results: FlashSaleState[] = [];

    for (const campaign of active) {
      const product_ids = await campaign_recommendation_service.get_flash_sale_products(
        campaign.id,
        20,
      );

      const sections = await db
        .select()
        .from(campaign_sections)
        .where(
          and(
            eq(campaign_sections.campaign_id, campaign.id),
            eq(campaign_sections.is_active, true),
          ),
        )
        .orderBy(sql`${campaign_sections.sort_order} ASC`);

      const timer = this.compute_timer(campaign.starts_at, campaign.ends_at);

      results.push({
        campaign_id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        starts_at: campaign.starts_at,
        ends_at: campaign.ends_at,
        time_remaining_seconds: timer.time_remaining_seconds,
        is_active: timer.is_active,
        is_ending_soon: timer.is_ending_soon,
        product_ids,
        theme: campaign.theme as Record<string, unknown>,
      });
    }

    return results;
  }

  async get_flash_sale_by_slug(slug: string): Promise<FlashSaleState | null> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.slug, slug),
          eq(campaigns.campaign_type, CAMPAIGN_TYPE.flash_sale),
        ),
      )
      .limit(1);

    if (!campaign) return null;

    const product_ids = await campaign_recommendation_service.get_flash_sale_products(
      campaign.id,
      50,
    );

    const timer = this.compute_timer(campaign.starts_at, campaign.ends_at);

    return {
      campaign_id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      starts_at: campaign.starts_at,
      ends_at: campaign.ends_at,
      time_remaining_seconds: timer.time_remaining_seconds,
      is_active: campaign.status === CAMPAIGN_STATUS.active && timer.is_active,
      is_ending_soon: timer.is_ending_soon,
      product_ids,
      theme: campaign.theme as Record<string, unknown>,
    };
  }

  compute_timer(
    starts_at: string | null,
    ends_at: string | null,
  ): FlashSaleTimer {
    const now = Date.now();
    const start = starts_at ? new Date(starts_at).getTime() : 0;
    const end = ends_at ? new Date(ends_at).getTime() : now + 3600000;

    const total_duration = end - start;
    const elapsed = Math.max(0, now - start);
    const remaining = Math.max(0, end - now);

    return {
      campaign_id: "",
      starts_at,
      ends_at,
      time_remaining_seconds: Math.floor(remaining / 1000),
      total_duration_seconds: Math.floor(total_duration / 1000),
      elapsed_percentage: total_duration > 0 ? Math.min(100, (elapsed / total_duration) * 100) : 0,
      is_active: remaining > 0 && now >= start,
      is_ending_soon: remaining > 0 && remaining < 3600000,
    };
  }

  async invalidate_flash_sale_cache(): Promise<void> {
    const sales = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.campaign_type, CAMPAIGN_TYPE.flash_sale),
          eq(campaigns.status, CAMPAIGN_STATUS.active),
        ),
      );

    await Promise.all(sales.map((s) => campaign_cache.invalidate(s.id)));
    await campaign_cache.invalidate_all_sections();
  }
}

export const campaign_flash_sale_service = new CampaignFlashSaleService();
