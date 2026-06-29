"use client";

import type { CampaignBanner } from "./types";
import { CampaignCountdownBar } from "./storefront-countdown-bar";

interface Props {
  banners: CampaignBanner[];
  locale?: string;
}

export function StorefrontCampaignBanners({ banners }: Props) {
  if (!banners?.length) return null;

  return (
    <>
      {banners.map((banner) => (
        <BannerSlot key={banner.id} banner={banner} />
      ))}
    </>
  );
}

function BannerSlot({ banner }: { banner: CampaignBanner }) {
  if (banner.banner_type === "countdown_bar") {
    return <CampaignCountdownBar banner={banner} />;
  }

  const href = banner.link_url ?? "#";
  const target = banner.link_target ?? "_self";

  const overlay = banner.overlay_content?.en ?? null;

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`storefront-banner storefront-banner--${banner.banner_type} relative block w-full overflow-hidden`}
    >
      <picture>
        {banner.mobile_image_url && (
          <source media="(max-width: 768px)" srcSet={banner.mobile_image_url} />
        )}
        <img
          src={banner.image_url ?? ""}
          alt={banner.alt_text ?? ""}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </picture>
      {overlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-6 text-white">
          {overlay.headline && (
            <h2 className="text-2xl md:text-4xl font-bold mb-2">{overlay.headline}</h2>
          )}
          {overlay.body && <p className="text-base md:text-lg mb-4">{overlay.body}</p>}
          {overlay.cta && (
            <span className="inline-block rounded bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-gray-200">
              {overlay.cta}
            </span>
          )}
        </div>
      )}
    </a>
  );
}
