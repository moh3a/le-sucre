import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/storefront/section-header";
import { InfoCard } from "@/components/storefront/info-card";
import { CategoryCard } from "@/features/product_information_management/categories/components/storefront/category-card";

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("home.title") };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8">
      {/* HERO BANNER */}
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

      {/* FEATURED CATEGORIES */}
      <section className="space-y-6">
        <SectionHeader
          title={t("home.categories")}
          actionLabel={t("home.see_all")}
          actionHref="/categories"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCard
              key={i}
              category={{
                id: String(i),
                name: t("home.category_name", { index: i + 1 }),
                slug: `category-${i + 1}`,
                description: null,
                image_url: null,
                children: [],
              }}
              variant="home"
            />
          ))}
        </div>
      </section>

      {/* FLASH SALE COUNTDOWN */}
      <section className="bg-olive-leaf/10 space-y-6 rounded-xl p-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold">{t("home.flash_sale")}</h2>
            <p className="text-muted-foreground">
              {t("home.flash_sale_subtitle")}
            </p>
          </div>
          <div className="flex gap-3 text-center">
            {["08", "12", "45", "30"].map((val, i) => (
              <div key={i} className="bg-background rounded-lg px-3 py-2 shadow-sm">
                <span className="text-2xl font-bold">{val}</span>
                <p className="text-muted-foreground text-xs">
                  {[t("home.countdown_hours"), t("home.countdown_minutes"), t("home.countdown_seconds"), t("home.countdown_days")][i]}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">{t("home.flash_product", { index: i + 1 })}</p>
              <div className="flex items-center gap-2">
                <span className="text-destructive font-semibold">{(4 - i) * 1000} DZD</span>
                <span className="text-muted-foreground text-xs line-through">
                  {(4 - i) * 1500} DZD
                </span>
              </div>
              <Badge variant="destructive">-{(4 - i) * 10}%</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="space-y-6">
        <SectionHeader
          title={t("home.trending")}
          actionLabel={t("home.see_all")}
          actionHref="/best-sellers"
        />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="min-w-[200px] shrink-0 space-y-2 p-3">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="space-y-6">
        <SectionHeader
          title={t("home.new_arrivals")}
          actionLabel={t("home.see_all")}
          actionHref="/new-arrivals"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">{t("home.new_product", { index: i + 1 })}</p>
              <p className="text-muted-foreground text-sm">{(i + 1) * 2000} DZD</p>
              <Badge variant="secondary">{t("home.new")}</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="space-y-6">
        <SectionHeader
          title={t("home.best_sellers")}
          actionLabel={t("home.see_all")}
          actionHref="/best-sellers"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">{t("home.best_seller_product", { index: i + 1 })}</p>
              <p className="text-muted-foreground text-sm">{(i + 1) * 3000} DZD</p>
              <div className="flex items-center gap-1 text-xs text-yellow-500">
                {"★".repeat(5 - i)}{"☆".repeat(i)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="space-y-6 py-8">
        <h2 className="text-center text-2xl font-bold">{t("home.brands")}</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-8 w-24 rounded" />
          ))}
        </div>
      </section>

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

      {/* NEWSLETTER CTA */}
      <section className="bg-olive-leaf space-y-4 rounded-xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold">{t("home.newsletter_title")}</h2>
        <p className="text-white/80">
          {t("home.newsletter_subtitle")}
        </p>
        <div className="mx-auto flex max-w-md gap-2">
          <input
            type="email"
            placeholder={t("home.newsletter_placeholder")}
            className="text-foreground flex-1 rounded-md px-4 py-2"
          />
          <Button variant="secondary">{t("home.newsletter_subscribe")}</Button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="space-y-6">
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
      </section>
    </div>
  );
}
