import { LayoutGrid, Sparkles, ArrowRight, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { CategoryCard } from "@/features/product_information_management/categories/components/storefront/category-card";
import { CategoryGrid } from "@/features/product_information_management/categories/components/storefront/category-grid";
import { DataState } from "@/components/storefront/data-state";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { SectionHeader } from "@/components/storefront/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  let tree: Awaited<ReturnType<typeof category_service.get_full_tree>> = [];
  try {
    tree = await category_service.get_full_tree(true);
  } catch {
    tree = [];
  }

  const totalCategories = tree.length;
  const featuredCategories = tree.slice(0, 4);

  return (
    <div className="mx-auto container space-y-12 px-4 py-8">
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("categories") }]} />

      {/* HERO SECTION */}
      <section className="from-lemon-lime/20 to-lemon-chiffon/40 relative overflow-hidden rounded-2xl bg-linear-to-r p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge className="bg-crimson-violet text-white">
            <Sparkles className="mr-1 size-3" />
            {t("shop_by")}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("page_title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("page_description")}
          </p>
          <div className="pt-2">
            <Badge variant="secondary" className="text-sm">
              {t("categories_count", { count: totalCategories })}
            </Badge>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-5">
          <LayoutGrid className="h-full w-full" />
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <DataState
        isEmpty={featuredCategories.length === 0}
        emptyIcon={<Sparkles className="text-muted-foreground/40 h-8 w-8" />}
        emptyTitle=""
        emptyDescription=""
      >
        <section className="space-y-6">
          <SectionHeader
            title={t("featured")}
            actionLabel={t("all_categories")}
            actionHref="#all"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link key={category.id} href={`/c/${category.slug}`} className="group block">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-lemon-lime/20 group-hover:bg-lemon-lime/30 flex size-16 items-center justify-center rounded-full transition-colors">
                      <LayoutGrid className="text-olive-leaf size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{category.name}</p>
                      {category.children.length > 0 && (
                        <p className="text-muted-foreground text-xs">
                          {category.children.length} {t("subcategories").toLowerCase()}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </DataState>

      {/* ALL CATEGORIES WITH SEARCH */}
      <section id="all" className="space-y-6">
        <SectionHeader title={t("all_categories")} />
        <CategoryGrid
          categories={tree.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image_url: null,
            children: cat.children.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description ?? null,
              image_url: null,
              children: [],
            })),
          }))}
          searchPlaceholder={t("search_placeholder")}
          resultsCount={t("results_count", { count: "0" })}
          noResults={t("no_results")}
          emptyTitle={t("empty_title")}
          emptyDescription={t("empty_description")}
        />
      </section>

      {/* PROMO BANNER */}
      <section className="bg-olive-leaf/10 rounded-xl p-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Tag className="text-olive-leaf size-5" />
              <h2 className="text-2xl font-bold">{t("promotions_title")}</h2>
            </div>
            <p className="text-muted-foreground">{t("promotions_desc")}</p>
          </div>
          <Button asChild>
            <Link href="/promotions">
              {t("explore")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* NEWSLETTER CTA */}
      <section className="border-border rounded-xl border p-8 text-center">
        <div className="mx-auto max-w-lg space-y-4">
          <h2 className="text-2xl font-bold">{t("newsletter_title")}</h2>
          <p className="text-muted-foreground">{t("newsletter_desc")}</p>
          <Button size="lg" className="mt-4">
            {t("newsletter_button")}
          </Button>
        </div>
      </section>
    </div>
  );
}
