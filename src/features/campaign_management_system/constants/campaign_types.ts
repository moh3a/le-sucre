export const CAMPAIGN_TYPE = {
  homepage: "homepage",
  seasonal: "seasonal",
  flash_sale: "flash_sale",
  targeted: "targeted",
  banner: "banner",
  category: "category",
  brand: "brand",
  landing_page: "landing_page",
} as const;

export type CampaignType = (typeof CAMPAIGN_TYPE)[keyof typeof CAMPAIGN_TYPE];

export const CAMPAIGN_STATUS = {
  draft: "draft",
  scheduled: "scheduled",
  active: "active",
  paused: "paused",
  ended: "ended",
  cancelled: "cancelled",
} as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];

export const BANNER_TYPE = {
  hero: "hero",
  sidebar: "sidebar",
  popup: "popup",
  inline: "inline",
  countdown_bar: "countdown_bar",
  notification_bar: "notification_bar",
} as const;

export type BannerType = (typeof BANNER_TYPE)[keyof typeof BANNER_TYPE];

export const SECTION_TYPE = {
  product_grid: "product_grid",
  product_carousel: "product_carousel",
  category_showcase: "category_showcase",
  brand_showcase: "brand_showcase",
  banner_row: "banner_row",
  countdown: "countdown",
  text_block: "text_block",
  video: "video",
} as const;

export type SectionType = (typeof SECTION_TYPE)[keyof typeof SECTION_TYPE];

export const TARGET_TYPE = {
  category: "category",
  brand: "brand",
  customer_group: "customer_group",
  country: "country",
  language: "language",
  behavior: "behavior",
  new_customer: "new_customer",
  returning_customer: "returning_customer",
  all: "all",
} as const;

export type TargetType = (typeof TARGET_TYPE)[keyof typeof TARGET_TYPE];

export const CAMPAIGN_JOB_TYPE = {
  activate_campaign: "activate_campaign",
  deactivate_campaign: "deactivate_campaign",
  sync_sections: "sync_sections",
  rollup_analytics: "rollup_analytics",
} as const;

export type CampaignJobType = (typeof CAMPAIGN_JOB_TYPE)[keyof typeof CAMPAIGN_JOB_TYPE];

export const DEVICE_TARGET = {
  desktop: "desktop",
  mobile: "mobile",
  both: "both",
} as const;

export const CAMPAIGN_PLACEMENT_PAGES = [
  "home",
  "category",
  "product",
  "landing",
  "cart",
  "search",
] as const;

export type CampaignPlacementPage = (typeof CAMPAIGN_PLACEMENT_PAGES)[number];
