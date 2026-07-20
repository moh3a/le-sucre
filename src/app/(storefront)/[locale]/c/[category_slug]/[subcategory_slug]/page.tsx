import { getTranslations } from "next-intl/server";
import { eq, or, and, inArray, sql, desc } from "drizzle-orm";
import { notFound } from "next/navigation";

import { CatalogSearchPageClient } from "@/features/product_information_management/catalog_discovery/components/catalog-search-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";
import { categories } from "@/features/product_information_management/categories/schema";
import { products } from "@/features/product_information_management/products/schema";
import { brands } from "@/features/product_information_management/brands/schema";
import type { AppLocale } from "@/i18n/config";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; category_slug: string; subcategory_slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      path: categories.path,
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return row ?? null;
}

async function getBrandsForCategory(categoryId: string, categoryPath: string) {
  const descendantRows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      or(
        eq(categories.id, categoryId),
        sql`${categories.path} LIKE ${sql`CONCAT(${categoryPath}, '/%')`}`,
      ),
    );

  if (!descendantRows.length) return [];

  const descendantIds = descendantRows.map((r) => r.id);

  return db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      logo_url: brands.logo_url,
    })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brand_id))
    .where(
      and(
        inArray(products.category_id, descendantIds),
        eq(products.status, "published"),
        eq(brands.is_active, true),
      ),
    )
    .groupBy(brands.id, brands.name, brands.slug)
    .orderBy(desc(sql<number>`COUNT(*)`))
    .limit(20);
}

export async function generateMetadata({ params }: Props) {
  const { locale, subcategory_slug } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const subcategory = await getCategoryBySlug(subcategory_slug);
  if (!subcategory) return { title: t("not_found") };

  return {
    title: subcategory.name,
    description: subcategory.description ?? t("meta_description", { name: subcategory.name }),
    robots: { index: true, follow: true },
  };
}

export default async function SubcategoryPage({ params, searchParams }: Props) {
  const { locale, category_slug, subcategory_slug } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });

  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(category_slug),
    getCategoryBySlug(subcategory_slug),
  ]);

  if (!category || !subcategory) notFound();

  const brandsForCategory = await getBrandsForCategory(subcategory.id, subcategory.path);

  const sp = await searchParams;
  const filters = parse_catalog_search_params(sp);

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: category.name, href: `/c/${category.slug}` },
    { label: subcategory.name },
  ];

  return (
    <CatalogSearchPageClient
      locale={locale as AppLocale}
      initial={filters}
      category_id={subcategory.id}
      category_slug={subcategory.slug}
      category_name={subcategory.name}
      category_description={subcategory.description}
      brands={brandsForCategory}
      header={<StorefrontBreadcrumbs items={breadcrumbs} />}
    />
  );
}
