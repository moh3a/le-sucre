import { getTranslations } from "next-intl/server";
import { CatalogSearchPageClient } from "@/features/product_information_management/catalog_discovery/components/catalog-search-page-client";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";
import type { AppLocale } from "@/i18n/config";

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
  return <CatalogSearchPageClient locale={locale as AppLocale} initial={filters} />;
}
