/* eslint-disable @next/next/no-img-element */
"use client";

import type { StorefrontSection } from "./types";
import { StorefrontFlashSaleTimer } from "./storefront-flash-sale-timer";

interface Props {
  section: StorefrontSection;
  locale?: string;
}

export function StorefrontSectionRenderer({ section, locale = "en" }: Props) {
  const headingText = section.heading?.[locale as keyof typeof section.heading] ?? null;

  return (
    <section className={`storefront-section storefront-section--${section.section_type} my-8`}>
      {headingText && <h2 className="mb-4 text-2xl font-bold tracking-tight">{headingText}</h2>}
      <div className="storefront-section__content">
        <SectionContent section={section} />
      </div>
    </section>
  );
}

function SectionContent({ section }: { section: StorefrontSection }) {
  switch (section.section_type) {
    case "product_grid":
      return <ProductGridSection section={section} />;
    case "product_carousel":
      return <ProductCarouselSection section={section} />;
    case "category_showcase":
      return <CategoryShowcaseSection section={section} />;
    case "brand_showcase":
      return <BrandShowcaseSection section={section} />;
    case "banner_row":
      return <BannerRowSection section={section} />;
    case "countdown":
      return <CountdownSection section={section} />;
    case "text_block":
      return <TextBlockSection section={section} />;
    case "video":
      return <VideoSection section={section} />;
    default:
      return <ProductGridSection section={section} />;
  }
}

function ProductGridSection({ section }: { section: StorefrontSection }) {
  const columns = (section.config.columns as number) ?? 4;
  const product_ids = (section.config.product_ids as string[]) ?? section.products ?? [];

  if (!product_ids.length) return null;

  return (
    <div
      className="product-grid grid gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, 6)}, 1fr)` }}
    >
      {product_ids.map((id) => (
        <ProductCard key={id} product_id={id} />
      ))}
    </div>
  );
}

function ProductCarouselSection({ section }: { section: StorefrontSection }) {
  const product_ids = (section.config.product_ids as string[]) ?? section.products ?? [];

  if (!product_ids.length) return null;

  return (
    <div className="product-carousel flex scrollbar-thin gap-4 overflow-x-auto pb-4">
      {product_ids.map((id) => (
        <div key={id} className="min-w-[200px] shrink-0">
          <ProductCard product_id={id} />
        </div>
      ))}
    </div>
  );
}

function CategoryShowcaseSection({ section }: { section: StorefrontSection }) {
  const category_ids = (section.config.category_ids as string[]) ?? [];

  if (!category_ids.length) return null;

  return (
    <div className="category-showcase grid grid-cols-2 gap-4 md:grid-cols-4">
      {category_ids.map((id) => (
        <CategoryCard key={id} category_id={id} />
      ))}
    </div>
  );
}

function BrandShowcaseSection({ section }: { section: StorefrontSection }) {
  const brand_ids = (section.config.brand_ids as string[]) ?? [];

  if (!brand_ids.length) return null;

  return (
    <div className="brand-showcase grid grid-cols-3 gap-4 md:grid-cols-6">
      {brand_ids.map((id) => (
        <BrandCard key={id} brand_id={id} />
      ))}
    </div>
  );
}

function BannerRowSection({ section }: { section: StorefrontSection }) {
  const images = (section.config.images as string[]) ?? [];

  if (!images.length) return null;

  return (
    <div className="banner-row grid grid-cols-1 gap-4 md:grid-cols-2">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="h-auto w-full rounded-lg object-cover"
          loading="lazy"
        />
      ))}
    </div>
  );
}

function CountdownSection({ section }: { section: StorefrontSection }) {
  const target_date = section.config.target_date as string;

  if (!target_date) return null;

  return (
    <div className="countdown-section flex flex-col items-center justify-center rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 p-8 text-white">
      <StorefrontFlashSaleTimer ends_at={target_date} />
    </div>
  );
}

function TextBlockSection({ section }: { section: StorefrontSection }) {
  const content = section.config.content as string;

  if (!content) return null;

  return (
    <div className="text-block prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

function VideoSection({ section }: { section: StorefrontSection }) {
  const url = section.config.video_url as string;
  const autoplay = (section.config.autoplay as boolean) ?? false;

  if (!url) return null;

  return (
    <div className="video-section aspect-video overflow-hidden rounded-lg">
      <video
        src={url}
        controls
        autoPlay={autoplay}
        muted={autoplay}
        loop={autoplay}
        playsInline
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// Placeholder cards – replace with actual linked components
function ProductCard({ product_id }: { product_id: string }) {
  return (
    <div className="product-card rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 aspect-square rounded-md bg-gray-100" />
      <div className="mb-1 h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <p className="mt-1 text-xs text-gray-400">{product_id.slice(0, 8)}</p>
    </div>
  );
}

function CategoryCard({}: { category_id: string }) {
  return (
    <div className="category-card rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 h-24 rounded-md bg-gray-100" />
      <div className="mx-auto h-4 w-3/4 rounded bg-gray-200" />
    </div>
  );
}

function BrandCard({}: { brand_id: string }) {
  return (
    <div className="brand-card flex items-center justify-center rounded-lg border bg-white p-4 shadow-sm">
      <div className="h-8 w-20 rounded bg-gray-200" />
    </div>
  );
}
