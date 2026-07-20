import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/storefront/section-header";
import { InfoCard } from "@/components/info-card";
import { CategoryCard } from "@/features/product_information_management/categories/components/storefront/category-card";
import { ProductCard } from "@/features/product_information_management/products/components/storefront/product-card";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { HeroBannerCarousel } from "@/components/storefront/hero-banner-carousel";
import { StorefrontSectionRenderer } from "@/features/campaign_management_system/components/storefront/storefront-section-renderer";
import { CountdownTimer } from "@/components/storefront/countdown-timer";
import { campaign_service } from "@/features/campaign_management_system/services/campaign.service";
import { campaign_flash_sale_service } from "@/features/campaign_management_system/services/campaign_flash_sale.service";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { search_service } from "@/features/product_information_management/catalog_discovery/services/search.service";
import { recommendation_service } from "@/features/product_information_management/recommendations/services/recommendation.service";
import { brand_service } from "@/features/product_information_management/brands/services/brand.service";
import type { CampaignBanner } from "@/features/campaign_management_system/components/storefront/types";
import type { StorefrontSection } from "@/features/campaign_management_system/components/storefront/types";
import type { CategoryItem, StorefrontProduct } from "@/components/storefront/types";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("home.title") };
}

type Props = {
  params: Promise<{ locale: string }>;
};

function categoryNodeToItem(node: CategoryTreeNode): CategoryItem {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    image_url: null,
    children: node.children.map(categoryNodeToItem),
  };
}

async function getCampaignData(locale: string) {
  try {
    const campaigns = await campaign_service.get_storefront_sections({
      locale: locale as "fr" | "en" | "ar",
      page_slug: "home",
    }) as Array<{
      banners: Array<{
        id: string;
        banner_type: string;
        image_url: string | null;
        mobile_image_url: string | null;
        video_url: string | null;
        link_url: string | null;
        link_target: string | null;
        alt_text: string | null;
        sort_order: number;
        is_active: boolean;
        placement: string[];
        overlay_content: {
          en?: { headline?: string; body?: string; cta?: string };
          fr?: { headline?: string; body?: string; cta?: string };
          ar?: { headline?: string; body?: string; cta?: string };
        } | null;
        device_target: string | null;
      }>;
      sections: Array<{
        id: string;
        section_type: string;
        sort_order: number;
        is_active: boolean;
        heading: { en?: string; fr?: string; ar?: string } | null;
        config: Record<string, unknown>;
      }>;
    }>;

    const banners: CampaignBanner[] = [];
    const sections: StorefrontSection[] = [];

    for (const campaign of campaigns) {
      for (const banner of campaign.banners) {
        if (banner.is_active) {
          banners.push({
            id: banner.id,
            banner_type: banner.banner_type,
            image_url: banner.image_url,
            mobile_image_url: banner.mobile_image_url,
            video_url: banner.video_url,
            link_url: banner.link_url,
            link_target: banner.link_target ?? "_self",
            alt_text: banner.alt_text,
            sort_order: banner.sort_order,
            is_active: banner.is_active,
            placement: (banner.placement as string[]) ?? [],
            overlay_content: banner.overlay_content as CampaignBanner["overlay_content"],
            device_target: banner.device_target ?? "all",
          });
        }
      }

      for (const section of campaign.sections) {
        if (section.is_active) {
          sections.push({
            id: section.id,
            section_type: section.section_type,
            sort_order: section.sort_order,
            heading: section.heading as StorefrontSection["heading"],
            config: (section.config as Record<string, unknown>) ?? {},
          });
        }
      }
    }

    return { banners, sections };
  } catch {
    return { banners: [] as CampaignBanner[], sections: [] as StorefrontSection[] };
  }
}

async function getHomepageData(locale: string) {
  const appLocale = locale as "fr" | "en" | "ar";

  const [
    categoriesResult,
    trendingResult,
    newArrivalsResult,
    bestSellersResult,
    flashSalesResult,
    brandsResult,
  ] = await Promise.allSettled([
    category_service.get_full_tree(true),
    recommendation_service.get_trending(appLocale, "week", 8),
    search_service.search({
      locale: appLocale,
      sort: "newest",
      limit: 8,
      page: 1,
      include_descendants: true,
      brand_ids: undefined,
      properties: undefined,
      in_stock_only: false,
    }),
    recommendation_service.get_trending(appLocale, "day", 4),
    campaign_flash_sale_service.get_active_flash_sales(appLocale),
    brand_service.list_active_storefront(),
  ]);

  const categories =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value.slice(0, 5).map(categoryNodeToItem)
      : [];

  const trending: StorefrontProduct[] =
    trendingResult.status === "fulfilled" ? trendingResult.value : [];

  const newArrivals: StorefrontProduct[] =
    newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value.items : [];

  const bestSellers: StorefrontProduct[] =
    bestSellersResult.status === "fulfilled" ? bestSellersResult.value : [];

  const brands =
    brandsResult.status === "fulfilled" ? brandsResult.value : [];

  let activeFlashSale: {
    slug: string;
    time_remaining_seconds: number;
  } | null = null;
  let flashSaleProducts: StorefrontProduct[] = [];

  if (flashSalesResult.status === "fulfilled" && flashSalesResult.value.length > 0) {
    const sale = flashSalesResult.value[0];
    if (sale.is_active) {
      activeFlashSale = {
        slug: sale.slug,
        time_remaining_seconds: sale.time_remaining_seconds,
      };
      if (sale.product_ids.length > 0) {
        try {
          const hydrated = await recommendation_service.hydrate_ids(
            appLocale,
            sale.product_ids.slice(0, 4),
          );
          flashSaleProducts = hydrated;
        } catch {
          flashSaleProducts = [];
        }
      }
    }
  }

  return {
    categories,
    trending,
    newArrivals,
    bestSellers,
    flashSale: activeFlashSale,
    flashSaleProducts,
    brands,
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const [{ banners, sections }, homepageData] = await Promise.all([
    getCampaignData(locale),
    getHomepageData(locale),
  ]);

  const { categories, trending, newArrivals, bestSellers, flashSale, flashSaleProducts, brands } =
    homepageData;

  return (
    <div className="mx-auto container space-y-16 p-6">
      <StorefrontBreadcrumbs items={[{ label: t("home.title") }]} />

      {/* HERO BANNER CAROUSEL — from campaigns */}
      <HeroBannerCarousel banners={banners} locale={locale} />

      {/* Fallback hero if no campaign banners */}
      {!banners.filter((b) => ["hero", "sidebar", "inline"].includes(b.banner_type)).length && (
        <section className="from-lemon-lime/20 to-lemon-chiffon/40 relative overflow-hidden rounded-2xl bg-linear-to-r p-12 md:p-20">
          <div className="relative z-10 max-w-xl space-y-4">
            <Badge className="bg-crimson-violet text-white">
              {t("home.new_collection")}
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl">
              {t("home.hero_title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("home.hero_subtitle")}
            </p>
            <Button size="lg">{t("home.shop_now")}</Button>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-[url('/placeholder-hero.png')] bg-cover bg-center opacity-20" />
        </section>
      )}

      {/* CAMPAIGN SECTIONS */}
      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map((section) => (
            <StorefrontSectionRenderer key={section.id} section={section} locale={locale} />
          ))}
        </div>
      )}

      {/* FEATURED CATEGORIES */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <SectionHeader
            title={t("home.categories")}
            actionLabel={t("home.see_all")}
            actionHref="/categories"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} variant="home" />
            ))}
          </div>
        </section>
      )}

      {/* FLASH SALE COUNTDOWN */}
      {flashSale && (
        <section className="bg-olive-leaf/10 space-y-6 rounded-xl p-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-2xl font-bold">{t("home.flash_sale")}</h2>
              <p className="text-muted-foreground">
                {t("home.flash_sale_subtitle")}
              </p>
            </div>
            <CountdownTimer
              remainingSeconds={flashSale.time_remaining_seconds}
              labels={{
                hours: t("home.countdown_hours"),
                minutes: t("home.countdown_minutes"),
                seconds: t("home.countdown_seconds"),
              }}
            />
          </div>
          {flashSaleProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {flashSaleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="flash-sale"
                />
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href={`/promotions/${flashSale.slug}`}>
                {t("home.see_all")}
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* TRENDING PRODUCTS */}
      {trending.length > 0 && (
        <section className="space-y-6">
          <SectionHeader
            title={t("home.trending")}
            actionLabel={t("home.see_all")}
            actionHref="/best-sellers"
          />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {trending.map((product) => (
              <div key={product.id} className="min-w-[200px] shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="space-y-6">
          <SectionHeader
            title={t("home.new_arrivals")}
            actionLabel={t("home.see_all")}
            actionHref="/new-arrivals"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="space-y-6">
          <SectionHeader
            title={t("home.best_sellers")}
            actionLabel={t("home.see_all")}
            actionHref="/best-sellers"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* BRAND STRIP */}
      {brands.length > 0 && (
        <section className="space-y-6 py-8">
          <h2 className="text-center text-2xl font-bold">{t("home.brands")}</h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-8 w-auto object-contain grayscale transition-all group-hover:grayscale-0"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-8 items-center px-4 text-sm font-semibold tracking-wider uppercase">
                    {brand.name}
                  </div>
                )}
                <span className="text-muted-foreground text-xs">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PROMOTIONAL BANNERS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          icon="🚚"
          title={t("home.promo_delivery")}
          description={t("home.promo_delivery_desc")}
        />
        <InfoCard
          icon="🔄"
          title={t("home.promo_return")}
          description={t("home.promo_return_desc")}
        />
      </section>

      {/* TODO: TESTIMONIALS */}
      {/* <section className="space-y-6">
        <h2 className="text-center text-2xl font-bold">
          {t("home.testimonials")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-6 text-center">
              <div className="bg-muted mx-auto h-16 w-16 rounded-full" />
              <p className="text-muted-foreground text-sm italic">
                &ldquo;{t("home.testimonial_text")}&rdquo;
              </p>
              <p className="text-sm font-medium">
                {t("home.testimonial_author_number", { index: i + 1 })}
              </p>
            </Card>
          ))}
        </div>
      </section> */}
    </div>
  );
}
