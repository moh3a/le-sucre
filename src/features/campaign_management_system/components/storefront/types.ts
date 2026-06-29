export interface CampaignBanner {
  id: string;
  banner_type: string;
  image_url: string | null;
  mobile_image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  link_target: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
  placement: string[];
  overlay_content: {
    en?: { headline?: string; body?: string; cta?: string };
    fr?: { headline?: string; body?: string; cta?: string };
    ar?: { headline?: string; body?: string; cta?: string };
  } | null;
  device_target: string;
}

export interface StorefrontSection {
  id: string;
  section_type: string;
  sort_order: number;
  heading: { en?: string; fr?: string; ar?: string } | null;
  config: Record<string, unknown>;
  products?: string[];
}

export interface FlashSaleCampaign {
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
