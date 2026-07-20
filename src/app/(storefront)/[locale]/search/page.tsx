import { getTranslations } from "next-intl/server";
import { CatalogSearchPageClient } from "@/features/product_information_management/catalog_discovery/components/catalog-search-page-client";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";
import type { AppLocale } from "@/i18n/config";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    title: q ? t("titleWithQuery", { query: q }) : t("title"),
    robots: { index: true, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const filters = parse_catalog_search_params(sp);
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("search") }]} />
      <CatalogSearchPageClient locale={locale as AppLocale} initial={filters} />
    </>
  );
}
