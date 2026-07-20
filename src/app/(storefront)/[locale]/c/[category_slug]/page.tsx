import { getTranslations } from "next-intl/server";
import { CatalogSearchPageClient } from "@/features/product_information_management/catalog_discovery/components/catalog-search-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";
import { db } from "@/lib/db";
import { categories } from "@/features/product_information_management/categories/schema";
import { products } from "@/features/product_information_management/products/schema";
import { brands } from "@/features/product_information_management/brands/schema";
import { eq, or, and, inArray, sql, desc } from "drizzle-orm";
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
      description: categories.description,
      path: categories.path,
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return row ?? null;
}

async function getSubcategories(categoryId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
    })
    .from(categories)
    .where(and(eq(categories.parent_id, categoryId), eq(categories.is_active, true)))
    .orderBy(categories.sort_order);
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
    .where(and(inArray(products.category_id, descendantIds), eq(products.status, "published"), eq(brands.is_active, true)))
    .groupBy(brands.id, brands.name, brands.slug)
    .orderBy(desc(sql<number>`COUNT(*)`))
    .limit(20);
}

export async function generateMetadata({ params }: Props) {
  const { locale, category_slug } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const category = await getCategory(category_slug);
  if (!category) return { title: t("not_found") };

  return {
    title: category.name,
    description: category.description ?? t("meta_description", { name: category.name }),
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, category_slug } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });

  let category: Awaited<ReturnType<typeof getCategory>>;
  try {
    category = await getCategory(category_slug);
  } catch {
    notFound();
  }
  if (!category) notFound();

  let subcategories: Awaited<ReturnType<typeof getSubcategories>> = [];
  let brandsForCategory: Awaited<ReturnType<typeof getBrandsForCategory>> = [];
  try {
    [subcategories, brandsForCategory] = await Promise.all([
      getSubcategories(category.id),
      getBrandsForCategory(category.id, category.path),
    ]);
  } catch {
    subcategories = [];
    brandsForCategory = [];
  }

  const sp = await searchParams;
  const filters = parse_catalog_search_params(sp);

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: category.name },
  ];

  return (
    <CatalogSearchPageClient
      locale={locale as AppLocale}
      initial={filters}
      category_id={category.id}
      category_slug={category.slug}
      category_name={category.name}
      category_description={category.description}
      subcategories={subcategories}
      brands={brandsForCategory}
      header={<StorefrontBreadcrumbs items={breadcrumbs} />}
    />
  );
}
