import type { Metadata } from "next";
import { CatalogSearchPageClient } from "@/features/product_information_management/catalog_discovery/components/catalog-search-page-client";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  return {
    title: q ? `Recherche : ${q} | Le Sucré` : "Recherche | Le Sucré",
    robots: { index: true, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const filters = parse_catalog_search_params(sp);
  return <CatalogSearchPageClient locale={locale as "fr" | "en"} initial={filters} />;
}
