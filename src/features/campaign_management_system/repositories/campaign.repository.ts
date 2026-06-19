import "server-only";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { format } from "date-fns";
import {
  campaigns,
  campaign_translations,
  campaign_banners,
  campaign_targets,
  campaign_sections,
  campaign_categories,
  campaign_brands,
  campaign_analytics_daily,
} from "../schema";
import { CAMPAIGN_STATUS } from "../constants/campaign_types";

function now_iso() {
  return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

function day_key(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export class CampaignRepository {
  // ─── Queries ──────────────────────────────────────────────────────────────

  async list_admin(
    page: number,
    limit: number,
    status?: string,
    campaign_type?: string,
    search?: string,
  ) {
    const offset = (page - 1) * limit;
    const clauses = [];

    if (status) clauses.push(eq(campaigns.status, status));
    if (campaign_type) clauses.push(eq(campaigns.campaign_type, campaign_type));
    if (search) clauses.push(ilike(campaigns.name, `%${search}%`));

    const where = clauses.length ? and(...clauses) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(campaigns)
        .where(where)
        .orderBy(asc(campaigns.priority), desc(campaigns.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(campaigns)
        .where(where),
    ]);

    const total = Number(count);
    return {
      items: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async stats() {
    const [total, active, scheduled, draft, paused, ended, cancelled] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(campaigns),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, CAMPAIGN_STATUS.active)),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, CAMPAIGN_STATUS.scheduled)),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, CAMPAIGN_STATUS.draft)),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, CAMPAIGN_STATUS.paused)),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, CAMPAIGN_STATUS.ended)),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, CAMPAIGN_STATUS.cancelled)),
    ]);

    return {
      total: Number(total[0].count),
      active: Number(active[0].count),
      scheduled: Number(scheduled[0].count),
      draft: Number(draft[0].count),
      paused: Number(paused[0].count),
      ended: Number(ended[0].count),
      cancelled: Number(cancelled[0].count),
    };
  }

  async get_by_id(id: string) {
    const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return row ?? null;
  }

  async get_by_slug(slug: string) {
    const [row] = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);
    return row ?? null;
  }

  async get_full(id: string) {
    const campaign = await this.get_by_id(id);
    if (!campaign) return null;

    const [translations, banners, targets, sections, linked_categories, linked_brands] =
      await Promise.all([
        db.select().from(campaign_translations).where(eq(campaign_translations.campaign_id, id)),
        db
          .select()
          .from(campaign_banners)
          .where(eq(campaign_banners.campaign_id, id))
          .orderBy(asc(campaign_banners.sort_order)),
        db.select().from(campaign_targets).where(eq(campaign_targets.campaign_id, id)),
        db
          .select()
          .from(campaign_sections)
          .where(eq(campaign_sections.campaign_id, id))
          .orderBy(asc(campaign_sections.sort_order)),
        db.select().from(campaign_categories).where(eq(campaign_categories.campaign_id, id)),
        db.select().from(campaign_brands).where(eq(campaign_brands.campaign_id, id)),
      ]);

    return {
      ...campaign,
      translations,
      banners,
      targets,
      sections,
      linked_categories,
      linked_brands,
    };
  }

  /** Active campaigns for a given page slug, filtered by targeting criteria */
  async list_active_for_page(
    page_slug: string,
    locale: string,
    country?: string,
    user_id?: string,
  ) {
    const now = now_iso();

    const active = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.status, CAMPAIGN_STATUS.active),
          or(sql`${campaigns.starts_at} IS NULL`, lte(campaigns.starts_at, now)),
          or(sql`${campaigns.ends_at} IS NULL`, gte(campaigns.ends_at, now)),
        ),
      )
      .orderBy(asc(campaigns.priority));

    const result = [];

    for (const campaign of active) {
      const targets = await db
        .select()
        .from(campaign_targets)
        .where(eq(campaign_targets.campaign_id, campaign.id));

      if (!(await this._matches_targeting(targets, locale, country, user_id))) continue;

      const sections = await db
        .select()
        .from(campaign_sections)
        .where(
          and(
            eq(campaign_sections.campaign_id, campaign.id),
            eq(campaign_sections.page_slug, page_slug),
            eq(campaign_sections.is_active, true),
          ),
        )
        .orderBy(asc(campaign_sections.sort_order));

      const banners = await db
        .select()
        .from(campaign_banners)
        .where(
          and(eq(campaign_banners.campaign_id, campaign.id), eq(campaign_banners.is_active, true)),
        )
        .orderBy(asc(campaign_banners.sort_order));

      const translation = await db
        .select()
        .from(campaign_translations)
        .where(
          and(
            eq(campaign_translations.campaign_id, campaign.id),
            eq(campaign_translations.locale, locale),
          ),
        )
        .limit(1);

      result.push({ ...campaign, sections, banners, translation: translation[0] ?? null });
    }

    return result;
  }

  private async _matches_targeting(
    targets: (typeof campaign_targets.$inferSelect)[],
    locale: string,
    country?: string,
    user_id?: string,
  ): Promise<boolean> {
    if (!targets.length) return true;

    // Separate inclusive vs exclusive rules
    const inclusive = targets.filter((t) => t.is_inclusive);
    const exclusive = targets.filter((t) => !t.is_inclusive);

    // Check exclusive blocks first
    for (const t of exclusive) {
      if (t.target_type === "language" && t.target_value === locale) return false;
      if (t.target_type === "country" && t.target_value === country) return false;
    }

    // If no inclusive rules, pass by default
    if (!inclusive.length) return true;

    // All-inclusive = always pass
    if (inclusive.some((t) => t.target_type === "all")) return true;

    let match = false;
    for (const t of inclusive) {
      if (t.target_type === "language" && t.target_value === locale) {
        match = true;
        break;
      }
      if (t.target_type === "country" && t.target_value === country) {
        match = true;
        break;
      }
      if (t.target_type === "new_customer" && !user_id) {
        match = true;
        break;
      }
      if (t.target_type === "returning_customer" && user_id) {
        match = true;
        break;
      }
    }

    return match;
  }

  // ─── Writes ───────────────────────────────────────────────────────────────

  async create(input: {
    name: string;
    slug: string;
    description?: string | null;
    campaign_type: string;
    status: string;
    priority: number;
    starts_at?: string | null;
    ends_at?: string | null;
    content?: Record<string, unknown>;
    theme?: Record<string, unknown>;
    promotion_id?: string | null;
    ab_test_group?: string | null;
    ab_traffic_split?: number;
    metadata?: Record<string, unknown>;
    created_by?: string | null;
    translations?: Array<{
      locale: string;
      title?: string | null;
      subtitle?: string | null;
      cta_label?: string | null;
      cta_url?: string | null;
      seo_title?: string | null;
      seo_description?: string | null;
    }>;
    banners?: Array<Omit<typeof campaign_banners.$inferInsert, "id" | "campaign_id">>;
    sections?: Array<Omit<typeof campaign_sections.$inferInsert, "id" | "campaign_id">>;
    targets?: Array<Omit<typeof campaign_targets.$inferInsert, "id" | "campaign_id">>;
    category_ids?: string[];
    brand_ids?: string[];
  }) {
    const id = generate_id();

    await db.insert(campaigns).values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      campaign_type: input.campaign_type,
      status: input.status,
      priority: input.priority,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      content: input.content ?? {},
      theme: input.theme ?? {},
      promotion_id: input.promotion_id ?? null,
      ab_test_group: input.ab_test_group ?? null,
      ab_traffic_split: input.ab_traffic_split ?? 100,
      metadata: input.metadata ?? {},
      created_by: input.created_by ?? null,
    });

    await this._sync_children(id, {
      translations: input.translations ?? [],
      banners: input.banners ?? [],
      sections: input.sections ?? [],
      targets: input.targets ?? [],
      category_ids: input.category_ids ?? [],
      brand_ids: input.brand_ids ?? [],
    });

    return this.get_full(id);
  }

  async update(
    id: string,
    patch: Partial<typeof campaigns.$inferInsert> & {
      translations?: Array<Omit<typeof campaign_translations.$inferInsert, "id" | "campaign_id">>;
      banners?: Array<Omit<typeof campaign_banners.$inferInsert, "id" | "campaign_id">>;
      sections?: Array<Omit<typeof campaign_sections.$inferInsert, "id" | "campaign_id">>;
      targets?: Array<Omit<typeof campaign_targets.$inferInsert, "id" | "campaign_id">>;
      category_ids?: string[];
      brand_ids?: string[];
    },
  ) {
    const { translations, banners, sections, targets, category_ids, brand_ids, ...camp_patch } =
      patch;

    if (Object.keys(camp_patch).length) {
      await db.update(campaigns).set(camp_patch).where(eq(campaigns.id, id));
    }

    if (
      translations !== undefined ||
      banners !== undefined ||
      sections !== undefined ||
      targets !== undefined ||
      category_ids !== undefined ||
      brand_ids !== undefined
    ) {
      await this._sync_children(id, {
        translations: translations ?? [],
        banners: banners ?? [],
        sections: sections ?? [],
        targets: targets ?? [],
        category_ids: category_ids ?? [],
        brand_ids: brand_ids ?? [],
      });
    }

    return this.get_full(id);
  }

  async set_status(id: string, status: string) {
    await db.update(campaigns).set({ status }).where(eq(campaigns.id, id));
    return this.get_by_id(id);
  }

  // ─── Banner ───────────────────────────────────────────────────────────────

  async add_banner(
    campaign_id: string,
    data: Omit<typeof campaign_banners.$inferInsert, "id" | "campaign_id">,
  ) {
    const id = generate_id();
    await db.insert(campaign_banners).values({ id, campaign_id, ...data });
    const [row] = await db
      .select()
      .from(campaign_banners)
      .where(eq(campaign_banners.id, id))
      .limit(1);
    return row;
  }

  async update_banner(id: string, data: Partial<typeof campaign_banners.$inferInsert>) {
    await db.update(campaign_banners).set(data).where(eq(campaign_banners.id, id));
    const [row] = await db
      .select()
      .from(campaign_banners)
      .where(eq(campaign_banners.id, id))
      .limit(1);
    return row ?? null;
  }

  async delete_banner(id: string) {
    await db.delete(campaign_banners).where(eq(campaign_banners.id, id));
  }

  async reorder_banners(campaign_id: string, ordered_ids: string[]) {
    for (let i = 0; i < ordered_ids.length; i++) {
      await db
        .update(campaign_banners)
        .set({ sort_order: i })
        .where(
          and(
            eq(campaign_banners.id, ordered_ids[i]!),
            eq(campaign_banners.campaign_id, campaign_id),
          ),
        );
    }
  }

  // ─── Section ──────────────────────────────────────────────────────────────

  async add_section(
    campaign_id: string,
    data: Omit<typeof campaign_sections.$inferInsert, "id" | "campaign_id">,
  ) {
    const id = generate_id();
    await db.insert(campaign_sections).values({ id, campaign_id, ...data });
    const [row] = await db
      .select()
      .from(campaign_sections)
      .where(eq(campaign_sections.id, id))
      .limit(1);
    return row;
  }

  async update_section(id: string, data: Partial<typeof campaign_sections.$inferInsert>) {
    await db.update(campaign_sections).set(data).where(eq(campaign_sections.id, id));
    const [row] = await db
      .select()
      .from(campaign_sections)
      .where(eq(campaign_sections.id, id))
      .limit(1);
    return row ?? null;
  }

  async delete_section(id: string) {
    await db.delete(campaign_sections).where(eq(campaign_sections.id, id));
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async increment_analytics(
    campaign_id: string,
    field:
      | "impressions"
      | "clicks"
      | "banner_clicks"
      | "add_to_cart"
      | "conversions"
      | "unique_visitors",
    revenue = 0,
  ) {
    const dk = day_key();
    await db
      .insert(campaign_analytics_daily)
      .values({
        id: generate_id(),
        campaign_id,
        day_key: dk,
        [field]: 1,
        revenue: String(revenue),
      })
      .onDuplicateKeyUpdate({
        set: {
          [field]: sql`${campaign_analytics_daily[field]} + 1`,
          revenue:
            revenue > 0
              ? sql`${campaign_analytics_daily.revenue} + ${String(revenue)}`
              : sql`${campaign_analytics_daily.revenue}`,
          updated_at: sql`NOW()`,
        },
      });
  }

  async get_analytics_range(campaign_id: string, from: string, to: string) {
    return db
      .select()
      .from(campaign_analytics_daily)
      .where(
        and(
          eq(campaign_analytics_daily.campaign_id, campaign_id),
          gte(campaign_analytics_daily.day_key, from),
          lte(campaign_analytics_daily.day_key, to),
        ),
      )
      .orderBy(asc(campaign_analytics_daily.day_key));
  }

  async get_analytics_summary(campaign_id: string) {
    const [row] = await db
      .select({
        total_impressions: sql<number>`SUM(${campaign_analytics_daily.impressions})`,
        total_clicks: sql<number>`SUM(${campaign_analytics_daily.clicks})`,
        total_banner_clicks: sql<number>`SUM(${campaign_analytics_daily.banner_clicks})`,
        total_add_to_cart: sql<number>`SUM(${campaign_analytics_daily.add_to_cart})`,
        total_conversions: sql<number>`SUM(${campaign_analytics_daily.conversions})`,
        total_revenue: sql<string>`SUM(${campaign_analytics_daily.revenue})`,
        total_unique_visitors: sql<number>`SUM(${campaign_analytics_daily.unique_visitors})`,
      })
      .from(campaign_analytics_daily)
      .where(eq(campaign_analytics_daily.campaign_id, campaign_id));

    return row ?? null;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async _sync_children(
    campaign_id: string,
    data: {
      translations: Array<Omit<typeof campaign_translations.$inferInsert, "id" | "campaign_id">>;
      banners: Array<Omit<typeof campaign_banners.$inferInsert, "id" | "campaign_id">>;
      sections: Array<Omit<typeof campaign_sections.$inferInsert, "id" | "campaign_id">>;
      targets: Array<Omit<typeof campaign_targets.$inferInsert, "id" | "campaign_id">>;
      category_ids: string[];
      brand_ids: string[];
    },
  ) {
    await Promise.all([
      db.delete(campaign_translations).where(eq(campaign_translations.campaign_id, campaign_id)),
      db.delete(campaign_banners).where(eq(campaign_banners.campaign_id, campaign_id)),
      db.delete(campaign_sections).where(eq(campaign_sections.campaign_id, campaign_id)),
      db.delete(campaign_targets).where(eq(campaign_targets.campaign_id, campaign_id)),
      db.delete(campaign_categories).where(eq(campaign_categories.campaign_id, campaign_id)),
      db.delete(campaign_brands).where(eq(campaign_brands.campaign_id, campaign_id)),
    ]);

    const inserts: Promise<unknown>[] = [];

    if (data.translations.length) {
      inserts.push(
        db
          .insert(campaign_translations)
          .values(data.translations.map((t) => ({ id: generate_id(), campaign_id, ...t }))),
      );
    }

    if (data.banners.length) {
      inserts.push(
        db.insert(campaign_banners).values(
          data.banners.map((b, i) => ({
            id: generate_id(),
            campaign_id,
            ...b,
            sort_order: b.sort_order ?? i,
          })),
        ),
      );
    }

    if (data.sections.length) {
      inserts.push(
        db.insert(campaign_sections).values(
          data.sections.map((s, i) => ({
            id: generate_id(),
            campaign_id,
            ...s,
            sort_order: s.sort_order ?? i,
          })),
        ),
      );
    }

    if (data.targets.length) {
      inserts.push(
        db
          .insert(campaign_targets)
          .values(data.targets.map((t) => ({ id: generate_id(), campaign_id, ...t }))),
      );
    }

    if (data.category_ids.length) {
      inserts.push(
        db.insert(campaign_categories).values(
          data.category_ids.map((category_id) => ({
            id: generate_id(),
            campaign_id,
            category_id,
          })),
        ),
      );
    }

    if (data.brand_ids.length) {
      inserts.push(
        db
          .insert(campaign_brands)
          .values(data.brand_ids.map((brand_id) => ({ id: generate_id(), campaign_id, brand_id }))),
      );
    }

    await Promise.all(inserts);
  }
}

export const campaign_repository = new CampaignRepository();
