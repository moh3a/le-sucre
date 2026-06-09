import { z } from "zod";
import {
  CAMPAIGN_TYPE,
  CAMPAIGN_STATUS,
  BANNER_TYPE,
  SECTION_TYPE,
  TARGET_TYPE,
} from "../constants/campaign_types";

// ─── Shared sub-schemas ────────────────────────────────────────────────────────

const localized_text = z
  .object({
    en: z.string().optional(),
    fr: z.string().optional(),
    ar: z.string().optional(),
  })
  .optional();

const campaign_content_schema = z
  .object({
    en: z
      .object({
        title: z.string().max(255).optional(),
        subtitle: z.string().max(512).optional(),
        cta_label: z.string().max(128).optional(),
        cta_url: z.string().url().optional(),
      })
      .optional(),
    fr: z
      .object({
        title: z.string().max(255).optional(),
        subtitle: z.string().max(512).optional(),
        cta_label: z.string().max(128).optional(),
        cta_url: z.string().url().optional(),
      })
      .optional(),
    ar: z
      .object({
        title: z.string().max(255).optional(),
        subtitle: z.string().max(512).optional(),
        cta_label: z.string().max(128).optional(),
        cta_url: z.string().url().optional(),
      })
      .optional(),
  })
  .optional();

const campaign_theme_schema = z
  .object({
    bg_color: z.string().max(32).optional(),
    text_color: z.string().max(32).optional(),
    accent_color: z.string().max(32).optional(),
    overlay_opacity: z.number().min(0).max(1).optional(),
    layout: z.enum(["full_width", "split", "card_grid", "carousel"]).optional(),
  })
  .optional();

const translation_schema = z.object({
  locale: z.enum(["en", "fr", "ar"]),
  title: z.string().max(255).optional(),
  subtitle: z.string().max(512).optional(),
  cta_label: z.string().max(128).optional(),
  cta_url: z.string().url().optional().or(z.literal("")),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(500).optional(),
});

const banner_schema = z.object({
  banner_type: z.enum(Object.values(BANNER_TYPE) as [string, ...string[]]).default("hero"),
  device_target: z.enum(["desktop", "mobile", "both"]).default("both"),
  image_url: z.string().url().optional().or(z.literal("")),
  mobile_image_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  link_url: z.string().url().optional().or(z.literal("")),
  link_target: z.enum(["_self", "_blank"]).default("_self"),
  alt_text: z.string().max(255).optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  placement: z.array(z.string()).default([]),
  overlay_content: z
    .object({
      en: z
        .object({
          headline: z.string().optional(),
          body: z.string().optional(),
          cta: z.string().optional(),
        })
        .optional(),
      fr: z
        .object({
          headline: z.string().optional(),
          body: z.string().optional(),
          cta: z.string().optional(),
        })
        .optional(),
      ar: z
        .object({
          headline: z.string().optional(),
          body: z.string().optional(),
          cta: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const section_schema = z.object({
  section_type: z.enum(Object.values(SECTION_TYPE) as [string, ...string[]]),
  page_slug: z.string().max(255).default("home"),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  heading: localized_text,
  config: z.record(z.string(), z.unknown()).default({}),
});

const target_schema = z.object({
  target_type: z.enum(Object.values(TARGET_TYPE) as [string, ...string[]]),
  target_value: z.string().max(255).optional(),
  behavior_rule: z.string().max(64).optional(),
  config: z.record(z.string(), z.unknown()).default({}),
  is_inclusive: z.boolean().default(true),
});

// ─── List ──────────────────────────────────────────────────────────────────────

export const list_campaigns_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(CAMPAIGN_STATUS) as [string, ...string[]]).optional(),
  campaign_type: z.enum(Object.values(CAMPAIGN_TYPE) as [string, ...string[]]).optional(),
  search: z.string().max(255).optional(),
});

// ─── Create ────────────────────────────────────────────────────────────────────

export const create_campaign_dto = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  campaign_type: z.enum(Object.values(CAMPAIGN_TYPE) as [string, ...string[]]),
  status: z.enum(Object.values(CAMPAIGN_STATUS) as [string, ...string[]]).default("draft"),
  priority: z.number().int().min(1).max(9999).default(100),
  starts_at: z.string().datetime({ offset: true }).optional(),
  ends_at: z.string().datetime({ offset: true }).optional(),
  content: campaign_content_schema,
  theme: campaign_theme_schema,
  promotion_id: z.string().max(255).optional(),
  ab_test_group: z.string().max(64).optional(),
  ab_traffic_split: z.number().int().min(0).max(100).default(100),
  metadata: z.record(z.string(), z.unknown()).default({}),
  translations: z.array(translation_schema).default([]),
  banners: z.array(banner_schema).default([]),
  sections: z.array(section_schema).default([]),
  targets: z.array(target_schema).default([]),
  category_ids: z.array(z.string()).default([]),
  brand_ids: z.array(z.string()).default([]),
});

// ─── Update ────────────────────────────────────────────────────────────────────

export const update_campaign_dto = create_campaign_dto.partial().extend({
  id: z.string().min(1).max(255),
});

// ─── Banner CRUD ───────────────────────────────────────────────────────────────

export const add_banner_dto = banner_schema.extend({
  campaign_id: z.string().min(1).max(255),
});

export const update_banner_dto = banner_schema.partial().extend({
  id: z.string().min(1).max(255),
});

export const reorder_banners_dto = z.object({
  campaign_id: z.string().min(1).max(255),
  ordered_ids: z.array(z.string().min(1).max(255)),
});

// ─── Section CRUD ──────────────────────────────────────────────────────────────

export const add_section_dto = section_schema.extend({
  campaign_id: z.string().min(1).max(255),
});

export const update_section_dto = section_schema.partial().extend({
  id: z.string().min(1).max(255),
});

// ─── Status transitions ────────────────────────────────────────────────────────

export const set_campaign_status_dto = z.object({
  id: z.string().min(1).max(255),
  status: z.enum(Object.values(CAMPAIGN_STATUS) as [string, ...string[]]),
});

// ─── Storefront ────────────────────────────────────────────────────────────────

export const storefront_home_sections_dto = z.object({
  locale: z.enum(["en", "fr", "ar"]).default("fr"),
  page_slug: z.string().max(255).default("home"),
  country: z.string().max(2).optional(),
  user_id: z.string().optional(),
});

export const track_campaign_event_dto = z.object({
  campaign_id: z.string().min(1).max(255),
  event_type: z.enum(["impression", "click", "banner_click", "add_to_cart", "conversion"]),
  locale: z.string().max(5).optional(),
  revenue: z.number().optional(),
});
