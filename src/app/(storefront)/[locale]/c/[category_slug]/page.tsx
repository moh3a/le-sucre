import { getTranslations } from "next-intl/server";
import { CatalogSearchPageClient } from "@/features/product_information_management/catalog_discovery/components/catalog-search-page-client";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";
import { db } from "@/lib/db";
import { categories } from "@/features/product_information_management/categories/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { AppLocale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string; category_slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function getCategory(slug: string) {
  const [row] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return row ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { locale, category_slug } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const category = await getCategory(category_slug);
  if (!category) return { title: t("not_found") };

  return {
    title: category.name,
    description: t("meta_description", { name: category.name }),
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, category_slug } = await params;
  const category = await getCategory(category_slug);
  if (!category) notFound();

  const sp = await searchParams;
  const filters = parse_catalog_search_params(sp);

  return (
    <CatalogSearchPageClient
      locale={locale as AppLocale}
      initial={filters}
      category_id={category.id}
      category_name={category.name}
    />
  );
}
