import "server-only";
import { db } from "@/lib/db";
import { eq, and, gte, lte, sql, asc } from "drizzle-orm";
import { campaigns, campaign_sections, campaign_banners, campaign_translations } from "../schema";
import { CAMPAIGN_TYPE, CAMPAIGN_STATUS } from "../constants/campaign_types";
import { campaign_recommendation_service } from "./campaign_recommendation.service";

export interface LandingPageSection {
  id: string;
  section_type: string;
  sort_order: number;
  heading: Record<string, string | undefined>;
  config: Record<string, unknown>;
  products: Array<{ product_id: string; score: number; reason: string }>;
}

export interface LandingPageBanner {
  id: string;
  banner_type: string;
  image_url: string | null;
  mobile_image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  link_target: string;
  alt_text: string | null;
  sort_order: number;
  overlay_content: Record<string, unknown>;
}

export interface LandingPageData {
  campaign_id: string;
  name: string;
  slug: string;
  description: string | null;
  content: Record<string, unknown>;
  theme: Record<string, unknown>;
  seo: {
    title: string | null;
    description: string | null;
  };
  sections: LandingPageSection[];
  banners: LandingPageBanner[];
}

export class CampaignLandingPageService {
  async get_landing_page(
    slug: string,
    locale: string = "fr",
    user_id?: string,
  ): Promise<LandingPageData | null> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.slug, slug),
          eq(campaigns.campaign_type, CAMPAIGN_TYPE.landing_page),
          eq(campaigns.status, CAMPAIGN_STATUS.active),
          or(sql`${campaigns.starts_at} IS NULL`, lte(campaigns.starts_at, sql`NOW()`)),
          or(sql`${campaigns.ends_at} IS NULL`, gte(campaigns.ends_at, sql`NOW()`)),
        ),
      )
      .limit(1);

    if (!campaign) return null;

    const [translation] = await db
      .select()
      .from(campaign_translations)
      .where(
        and(
          eq(campaign_translations.campaign_id, campaign.id),
          eq(campaign_translations.locale, locale),
        ),
      )
      .limit(1);

    const sections = await db
      .select()
      .from(campaign_sections)
      .where(
        and(
          eq(campaign_sections.campaign_id, campaign.id),
          eq(campaign_sections.is_active, true),
        ),
      )
      .orderBy(asc(campaign_sections.sort_order));

    const section_data: LandingPageSection[] = [];
    for (const section of sections) {
      const config = section.config as Record<string, unknown> ?? {};
      const limit = (config.limit as number) ?? 12;

      const recommendations = await campaign_recommendation_service.get_recommendations({
        strategy: (config.strategy as string) as any ?? "trending",
        limit,
        category_id: config.category_id as string | undefined,
        brand_id: config.brand_id as string | undefined,
        user_id,
      });

      section_data.push({
        id: section.id,
        section_type: section.section_type,
        sort_order: section.sort_order,
        heading: section.heading as Record<string, string | undefined> ?? {},
        config,
        products: recommendations,
      });
    }

    const banners = await db
      .select()
      .from(campaign_banners)
      .where(
        and(
          eq(campaign_banners.campaign_id, campaign.id),
          eq(campaign_banners.is_active, true),
        ),
      )
      .orderBy(asc(campaign_banners.sort_order));

    return {
      campaign_id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description,
      content: campaign.content as Record<string, unknown>,
      theme: campaign.theme as Record<string, unknown>,
      seo: {
        title: translation?.seo_title ?? null,
        description: translation?.seo_description ?? null,
      },
      sections: section_data,
      banners: banners.map((b) => ({
        id: b.id,
        banner_type: b.banner_type,
        image_url: b.image_url,
        mobile_image_url: b.mobile_image_url,
        video_url: b.video_url,
        link_url: b.link_url,
        link_target: b.link_target,
        alt_text: b.alt_text,
        sort_order: b.sort_order,
        overlay_content: b.overlay_content as Record<string, unknown> ?? {},
      })),
    };
  }

  async get_landing_page_by_id(
    campaign_id: string,
    locale: string = "fr",
    user_id?: string,
  ): Promise<LandingPageData | null> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaign_id))
      .limit(1);

    if (!campaign || campaign.campaign_type !== CAMPAIGN_TYPE.landing_page) return null;

    return this.get_landing_page(campaign.slug, locale, user_id);
  }

  async get_landing_pages_for_storefront(
    locale: string = "fr",
  ): Promise<Array<{ slug: string; name: string; description: string | null; content: Record<string, unknown>; theme: Record<string, unknown> }>> {
    const rows = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.campaign_type, CAMPAIGN_TYPE.landing_page),
          eq(campaigns.status, CAMPAIGN_STATUS.active),
          or(sql`${campaigns.starts_at} IS NULL`, lte(campaigns.starts_at, sql`NOW()`)),
          or(sql`${campaigns.ends_at} IS NULL`, gte(campaigns.ends_at, sql`NOW()`)),
        ),
      )
      .orderBy(asc(campaigns.priority));

    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      content: r.content as Record<string, unknown>,
      theme: r.theme as Record<string, unknown>,
    }));
  }
}

export const campaign_landing_page_service = new CampaignLandingPageService();

function or(...conditions: ReturnType<typeof sql>[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}
