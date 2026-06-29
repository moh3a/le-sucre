import type { LandingPageData } from "../../services/campaign_landing_page.service";
import { StorefrontCampaignBanners } from "./storefront-campaign-banners";
import { StorefrontSectionRenderer } from "./storefront-section-renderer";
import type { CampaignBanner, StorefrontSection } from "./types";

interface Props {
  data: LandingPageData;
  locale?: string;
}

export function StorefrontLandingPageRenderer({ data, locale = "en" }: Props) {
  const banners = data.banners.map((b) => ({
    ...b,
    is_active: true,
    placement: [] as string[],
    device_target: "both",
  })) as CampaignBanner[];

  const sections = data.sections.map((s) => ({
    id: s.id,
    section_type: s.section_type,
    sort_order: s.sort_order,
    heading: s.heading as { en?: string; fr?: string; ar?: string },
    config: s.config,
    products: s.products.map((p) => p.product_id),
  })) as StorefrontSection[];

  const theme = data.theme as {
    bg_color?: string;
    text_color?: string;
    bg_image_url?: string | null;
    layout?: string;
  } | undefined;

  const style: Record<string, string> = {};
  if (theme?.bg_color) style.backgroundColor = theme.bg_color;
  if (theme?.text_color) style.color = theme.text_color;
  if (theme?.bg_image_url) style.backgroundImage = `url(${theme.bg_image_url})`;

  return (
    <div className="storefront-landing-page" style={style}>
      <StorefrontCampaignBanners banners={banners} locale={locale} />
      {sections.map((section) => (
        <StorefrontSectionRenderer key={section.id} section={section} locale={locale} />
      ))}
    </div>
  );
}
