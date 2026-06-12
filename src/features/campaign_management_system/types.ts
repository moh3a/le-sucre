export type CampaignType =
  | "homepage"
  | "seasonal"
  | "flash_sale"
  | "targeted"
  | "banner"
  | "category"
  | "brand"
  | "landing_page";

export type CampaignStatus = "draft" | "scheduled" | "active" | "paused" | "ended" | "cancelled";

export type BannerType =
  | "hero"
  | "sidebar"
  | "popup"
  | "inline"
  | "countdown_bar"
  | "notification_bar";

export type DeviceTarget = "desktop" | "mobile" | "both";

export type TargetType =
  | "category"
  | "brand"
  | "customer_group"
  | "country"
  | "language"
  | "behavior"
  | "new_customer"
  | "returning_customer"
  | "all";

export type SectionType =
  | "product_grid"
  | "product_carousel"
  | "category_showcase"
  | "brand_showcase"
  | "banner_row"
  | "countdown"
  | "text_block"
  | "video";

export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";

export type CamppaignJobType =
  | "activate_campaign"
  | "deactivate_campaign"
  | "sync_sections"
  | "rollup_analytics";
export type CampaignJobStatus = "pending" | "processing" | "done" | "failed";
