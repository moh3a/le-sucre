import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { categories } from "@/features/product_information_management/categories/schema";
import { brands } from "@/features/product_information_management/brands/schema";

// ─── Campaign (master entity) ────────────────────────────────────────────────

export const campaigns = mysqlTable(
  "campaigns",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),

    /**
     * @type CampaignType
     * homepage | seasonal | flash_sale | targeted | banner |
     * category | brand | landing_page
     */
    campaign_type: varchar("campaign_type", { length: 64 }).notNull(),

    /**
     * @type CampaignStatus
     * draft | scheduled | active | paused | ended | cancelled
     */
    status: varchar("status", { length: 32 }).notNull().default("draft"),

    priority: int("priority").notNull().default(100),

    starts_at: timestamp("starts_at", { mode: "string" }),
    ends_at: timestamp("ends_at", { mode: "string" }),

    /** Localized title/subtitle/cta displayed in storefront */
    content: json("content")
      .$type<{
        en?: { title?: string; subtitle?: string; cta_label?: string; cta_url?: string };
        fr?: { title?: string; subtitle?: string; cta_label?: string; cta_url?: string };
        ar?: { title?: string; subtitle?: string; cta_label?: string; cta_url?: string };
      }>()
      .default({}),

    /** Visual & theme config */
    theme: json("theme")
      .$type<{
        bg_color?: string;
        text_color?: string;
        accent_color?: string;
        overlay_opacity?: number;
        layout?: "full_width" | "split" | "card_grid" | "carousel";
        bg_image_url?: string | null;
      }>()
      .default({}),

    /** Optional linked promotion id for automated discount application */
    promotion_id: varchar("promotion_id", { length: 255 }),

    /** A/B testing variant group — null means not part of an A/B test */
    ab_test_group: varchar("ab_test_group", { length: 64 }),

    /** Percentage of traffic assigned to this variant (0–100) */
    ab_traffic_split: int("ab_traffic_split").default(100),

    metadata: json("metadata").$type<Record<string, unknown>>().default({}),

    created_by: varchar("created_by", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("campaigns_slug_uidx").on(t.slug),
    index("campaigns_type_status_idx").on(t.campaign_type, t.status),
    index("campaigns_schedule_idx").on(t.status, t.starts_at, t.ends_at),
    index("campaigns_priority_idx").on(t.priority),
  ],
);

// ─── Campaign Translations ────────────────────────────────────────────────────

export const campaign_translations = mysqlTable(
  "campaign_translations",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 5 }).notNull(), // en | fr | ar
    title: varchar("title", { length: 255 }),
    subtitle: varchar("subtitle", { length: 512 }),
    cta_label: varchar("cta_label", { length: 128 }),
    cta_url: varchar("cta_url", { length: 2048 }),
    seo_title: varchar("seo_title", { length: 255 }),
    seo_description: varchar("seo_description", { length: 500 }),
  },
  (t) => [
    uniqueIndex("campaign_translations_campaign_locale_uidx").on(t.campaign_id, t.locale),
    index("campaign_translations_locale_idx").on(t.locale),
  ],
);

// ─── Campaign Banners ─────────────────────────────────────────────────────────

export const campaign_banners = mysqlTable(
  "campaign_banners",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),

    /** @type BannerType hero | sidebar | popup | inline | countdown_bar | notification_bar */
    banner_type: varchar("banner_type", { length: 32 }).notNull().default("hero"),

    /** @type DeviceTarget desktop | mobile | both */
    device_target: varchar("device_target", { length: 16 }).notNull().default("both"),

    image_url: varchar("image_url", { length: 2048 }),
    mobile_image_url: varchar("mobile_image_url", { length: 2048 }),
    video_url: varchar("video_url", { length: 2048 }),

    /** Link destination when banner is clicked */
    link_url: varchar("link_url", { length: 2048 }),
    link_target: varchar("link_target", { length: 16 }).notNull().default("_self"),

    alt_text: varchar("alt_text", { length: 255 }),
    sort_order: int("sort_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),

    /** Pages where this banner appears: home | category | product | landing */
    placement: json("placement").$type<string[]>().default([]),

    /** Localized overlay text per banner slot */
    overlay_content: json("overlay_content")
      .$type<{
        en?: { headline?: string; body?: string; cta?: string };
        fr?: { headline?: string; body?: string; cta?: string };
        ar?: { headline?: string; body?: string; cta?: string };
      }>()
      .default({}),

    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("campaign_banners_campaign_idx").on(t.campaign_id, t.is_active),
    index("campaign_banners_sort_idx").on(t.campaign_id, t.sort_order),
    index("campaign_banners_type_idx").on(t.banner_type, t.is_active),
  ],
);

// ─── Campaign Targeting Rules ─────────────────────────────────────────────────

export const campaign_targets = mysqlTable(
  "campaign_targets",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),

    /**
     * @type TargetType
     * category | brand | customer_group | country | language |
     * behavior | new_customer | returning_customer | all
     */
    target_type: varchar("target_type", { length: 32 }).notNull(),

    /** Scoped entity id (category_id, brand_id, country_code, locale, etc.) */
    target_value: varchar("target_value", { length: 255 }),

    /** Behavior rule: viewed_product | purchased_category | cart_abandoned */
    behavior_rule: varchar("behavior_rule", { length: 64 }),

    /** Structured config for complex rules (AI-ready extension point) */
    config: json("config").$type<Record<string, unknown>>().default({}),

    is_inclusive: boolean("is_inclusive").notNull().default(true),
  },
  (t) => [
    index("campaign_targets_campaign_idx").on(t.campaign_id),
    index("campaign_targets_type_idx").on(t.target_type, t.target_value),
  ],
);

// ─── Campaign Sections (dynamic homepage slots) ───────────────────────────────

export const campaign_sections = mysqlTable(
  "campaign_sections",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),

    /**
     * @type SectionType
     * product_grid | product_carousel | category_showcase |
     * brand_showcase | banner_row | countdown | text_block | video
     */
    section_type: varchar("section_type", { length: 32 }).notNull(),

    /** Page(s) this section appears on */
    page_slug: varchar("page_slug", { length: 255 }).notNull().default("home"),

    sort_order: int("sort_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),

    /** Section heading (localized) */
    heading: json("heading").$type<{ en?: string; fr?: string; ar?: string }>().default({}),

    /** Section config: product_ids, category_id, brand_id, limit, etc. */
    config: json("config").$type<Record<string, unknown>>().default({}),

    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("campaign_sections_campaign_idx").on(t.campaign_id, t.is_active),
    index("campaign_sections_page_sort_idx").on(t.page_slug, t.sort_order),
  ],
);

// ─── Campaign Category Links ──────────────────────────────────────────────────

export const campaign_categories = mysqlTable(
  "campaign_categories",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    category_id: varchar("category_id", { length: 255 })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("campaign_categories_uidx").on(t.campaign_id, t.category_id),
    index("campaign_categories_category_idx").on(t.category_id),
  ],
);

// ─── Campaign Brand Links ─────────────────────────────────────────────────────

export const campaign_brands = mysqlTable(
  "campaign_brands",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    brand_id: varchar("brand_id", { length: 255 })
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("campaign_brands_uidx").on(t.campaign_id, t.brand_id),
    index("campaign_brands_brand_idx").on(t.brand_id),
  ],
);

// ─── Campaign Analytics (daily rollup) ───────────────────────────────────────

export const campaign_analytics_daily = mysqlTable(
  "campaign_analytics_daily",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    campaign_id: varchar("campaign_id", { length: 255 })
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    day_key: varchar("day_key", { length: 10 }).notNull(), // YYYY-MM-DD
    impressions: int("impressions").notNull().default(0),
    clicks: int("clicks").notNull().default(0),
    banner_clicks: int("banner_clicks").notNull().default(0),
    add_to_cart: int("add_to_cart").notNull().default(0),
    conversions: int("conversions").notNull().default(0),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    unique_visitors: int("unique_visitors").notNull().default(0),
    ctr: decimal("ctr", { precision: 8, scale: 4 }).default("0"), // click-through rate
    conversion_rate: decimal("conversion_rate", { precision: 8, scale: 4 }).default("0"),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("campaign_analytics_daily_uidx").on(t.campaign_id, t.day_key),
    index("campaign_analytics_daily_campaign_idx").on(t.campaign_id),
    index("campaign_analytics_daily_day_idx").on(t.day_key),
  ],
);

// ─── Campaign Scheduling Jobs ─────────────────────────────────────────────────

export const campaign_jobs = mysqlTable(
  "campaign_jobs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),

    /** activate_campaign | deactivate_campaign | sync_sections | rollup_analytics */
    job_type: varchar("job_type", { length: 64 }).notNull(),

    campaign_id: varchar("campaign_id", { length: 255 }).references(() => campaigns.id, {
      onDelete: "cascade",
    }),

    payload: json("payload").$type<Record<string, unknown>>().default({}),

    /** pending | processing | done | failed */
    status: varchar("status", { length: 32 }).notNull().default("pending"),

    run_after: timestamp("run_after", { mode: "string" }).defaultNow().notNull(),
    attempts: int("attempts").notNull().default(0),
    last_error: varchar("last_error", { length: 1000 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("campaign_jobs_status_run_idx").on(t.status, t.run_after),
    index("campaign_jobs_campaign_idx").on(t.campaign_id),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  created_by_user: one(users, {
    fields: [campaigns.created_by],
    references: [users.id],
  }),
  translations: many(campaign_translations),
  banners: many(campaign_banners),
  targets: many(campaign_targets),
  sections: many(campaign_sections),
  categories: many(campaign_categories),
  brands: many(campaign_brands),
  analytics_daily: many(campaign_analytics_daily),
  jobs: many(campaign_jobs),
}));

export const campaignTranslationsRelations = relations(campaign_translations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_translations.campaign_id],
    references: [campaigns.id],
  }),
}));

export const campaignBannersRelations = relations(campaign_banners, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_banners.campaign_id],
    references: [campaigns.id],
  }),
}));

export const campaignTargetsRelations = relations(campaign_targets, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_targets.campaign_id],
    references: [campaigns.id],
  }),
}));

export const campaignSectionsRelations = relations(campaign_sections, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_sections.campaign_id],
    references: [campaigns.id],
  }),
}));

export const campaignCategoriesRelations = relations(campaign_categories, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_categories.campaign_id],
    references: [campaigns.id],
  }),
  category: one(categories, {
    fields: [campaign_categories.category_id],
    references: [categories.id],
  }),
}));

export const campaignBrandsRelations = relations(campaign_brands, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_brands.campaign_id],
    references: [campaigns.id],
  }),
  brand: one(brands, {
    fields: [campaign_brands.brand_id],
    references: [brands.id],
  }),
}));

export const campaignAnalyticsDailyRelations = relations(campaign_analytics_daily, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_analytics_daily.campaign_id],
    references: [campaigns.id],
  }),
}));

export const campaignJobsRelations = relations(campaign_jobs, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaign_jobs.campaign_id],
    references: [campaigns.id],
  }),
}));
