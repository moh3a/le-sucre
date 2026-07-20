"use client";

import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CampaignBanner } from "@/features/campaign_management_system/components/storefront/types";

interface Props {
  banners: CampaignBanner[];
  locale?: string;
}

export function HeroBannerCarousel({ banners, locale = "fr" }: Props) {
  const heroBanners = banners.filter(
    (b) => b.is_active && ["hero", "sidebar", "inline"].includes(b.banner_type),
  );

  if (!heroBanners.length) return null;

  return (
    <section className="relative w-full">
      <Carousel
        plugins={
          heroBanners.length > 1 ? [Autoplay({ delay: 5000, stopOnInteraction: false })] : []
        }
        opts={{ loop: heroBanners.length > 1 }}
      >
        <CarouselContent>
          {heroBanners.map((banner) => {
            const overlay =
              banner.overlay_content?.[locale as keyof typeof banner.overlay_content] ??
              banner.overlay_content?.en ??
              null;
            const href = banner.link_url ?? "#";
            const target = banner.link_target ?? "_self";

            return (
              <CarouselItem key={banner.id}>
                <Link
                  href={href}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  className="group relative block w-full overflow-hidden rounded-2xl"
                >
                  <picture>
                    {banner.mobile_image_url && (
                      <source media="(max-width: 768px)" srcSet={banner.mobile_image_url} />
                    )}
                    {banner.video_url ? (
                      <video
                        src={banner.video_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[500px]"
                      />
                    ) : (
                      <img
                        src={banner.image_url ?? ""}
                        alt={banner.alt_text ?? ""}
                        className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[400px] lg:h-[500px]"
                        loading="lazy"
                      />
                    )}
                  </picture>

                  {overlay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-6 text-center text-white">
                      {overlay.headline && (
                        <h2 className="mb-2 text-2xl font-bold sm:text-3xl lg:text-5xl">
                          {overlay.headline}
                        </h2>
                      )}
                      {overlay.body && (
                        <p className="mb-4 max-w-lg text-sm sm:text-base lg:text-lg">
                          {overlay.body}
                        </p>
                      )}
                      {overlay.cta && (
                        <span className="inline-block rounded-2xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors group-hover:bg-white/90">
                          {overlay.cta}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {heroBanners.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
    </section>
  );
}
