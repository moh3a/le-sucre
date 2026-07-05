"use client";

import * as React from "react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { CatalogSortSelect } from "./catalog-sort-select";
import { CatalogFilterSidebar } from "./catalog-filter-sidebar";
import { CatalogMobileFiltersSheet } from "./catalog-mobile-filters-sheet";
import { CatalogProductGrid } from "./catalog-product-grid";
import { CatalogPagination } from "./catalog-pagination";
import { SearchPageSkeleton } from "./search-page-skeleton";
import type { CatalogSort } from "../types";

import type { CatalogSearchInput, CatalogFacetsInput } from "../models/search.dto";
import type { AppLocale } from "@/i18n/config";

interface CatalogSearchPageClientProps {
  locale: AppLocale;
  initial?: Partial<CatalogSearchInput>;
  category_id?: string;
  category_name?: string;
}

export function CatalogSearchPageClient({
  locale,
  initial,
  category_id,
  category_name,
}: CatalogSearchPageClientProps) {
  const t = useTranslations("catalog");

  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(initial?.q ?? ""),
      sort: parseAsString.withDefault(initial?.sort ?? "relevance"),
      page: parseAsInteger.withDefault(initial?.page ?? 1),
      brand: parseAsArrayOf(parseAsString, ",").withDefault((initial?.brand_ids as string[]) ?? []),
      price_max: parseAsInteger.withDefault(initial?.price_max ?? 20000),
      in_stock: parseAsBoolean.withDefault(initial?.in_stock_only ?? false),
    },
    {
      shallow: false,
    },
  );

  const [selectedProperties, setSelectedProperties] = React.useState<Record<string, string[]>>(
    (initial?.properties as Record<string, string[]>) ?? {},
  );

  const searchInput: CatalogSearchInput = {
    q: params.q || undefined,
    include_descendants: true,
    category_id,
    brand_ids: params.brand.length ? params.brand : undefined,
    price_min: 0,
    price_max: params.price_max,
    in_stock_only: params.in_stock,
    sort: params.sort as CatalogSort,
    properties: Object.keys(selectedProperties).length ? selectedProperties : undefined,
    page: params.page,
    limit: 12,
    locale,
  };

  const facetInput: CatalogFacetsInput = {
    q: params.q || undefined,
    include_descendants: true,
    category_id,
    brand_ids: params.brand.length ? params.brand : undefined,
    price_min: 0,
    price_max: params.price_max,
    in_stock_only: params.in_stock,
    properties: Object.keys(selectedProperties).length ? selectedProperties : undefined,
    locale,
  };

  const search_query = trpc.catalog.search.useQuery(searchInput);
  const { data: searchResult, isLoading: isSearchLoading } = search_query;
  const { data: facetsResult } = trpc.catalog.facets.useQuery(facetInput);

  const handlePropertyChange = (code: string, values: string[]) => {
    setSelectedProperties((prev) => {
      const next = { ...prev };
      if (!values.length) {
        delete next[code];
      } else {
        next[code] = values;
      }
      return next;
    });
    setParams({ page: 1 });
  };

  const activeFilterCount =
    (params.in_stock ? 1 : 0) +
    params.brand.length +
    (params.price_max < 20000 ? 1 : 0) +
    Object.values(selectedProperties).reduce((sum, v) => sum + v.length, 0);

  return (
    <QueryGuard query={search_query} loadingFallback={<SearchPageSkeleton />}>
      <div className="container mx-auto min-h-screen px-4 py-6">
        {/* Header: title + sort + mobile filter */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              {params.q ? (
                <>
                  <span className="text-muted-foreground font-normal">
                    {t("results", { count: searchResult?.meta.total_records ?? 0 })}
                    {" — "}
                  </span>
                  {params.q}
                </>
              ) : category_name ? (
                category_name
              ) : (
                t("default_heading")
              )}
            </h1>
            {!params.q && (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {t("results", { count: searchResult?.meta.total_records ?? 0 })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <div className="lg:hidden">
              <CatalogMobileFiltersSheet
                facets={facetsResult ?? undefined}
                selectedBrandIds={params.brand}
                onBrandChange={(brand) => setParams({ brand, page: 1 })}
                priceRange={[0, params.price_max]}
                onPriceChange={(range) => setParams({ price_max: range[1], page: 1 })}
                inStockOnly={params.in_stock}
                onInStockChange={(in_stock) => setParams({ in_stock, page: 1 })}
                selectedProperties={selectedProperties}
                onPropertyChange={handlePropertyChange}
                activeFilterCount={activeFilterCount}
              />
            </div>

            <CatalogSortSelect
              value={params.sort as CatalogSort}
              onChange={(sort) => setParams({ sort, page: 1 })}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <CatalogFilterSidebar
                facets={facetsResult ?? undefined}
                selectedBrandIds={params.brand}
                onBrandChange={(brand) => setParams({ brand, page: 1 })}
                priceRange={[0, params.price_max]}
                onPriceChange={(range) => setParams({ price_max: range[1], page: 1 })}
                inStockOnly={params.in_stock}
                onInStockChange={(in_stock) => setParams({ in_stock, page: 1 })}
                selectedProperties={selectedProperties}
                onPropertyChange={handlePropertyChange}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1 space-y-6">
            <CatalogProductGrid products={searchResult?.items ?? []} isLoading={isSearchLoading} />

            {searchResult && (
              <CatalogPagination
                page={params.page}
                totalPages={searchResult.meta.total_pages}
                onChange={(page) => setParams({ page })}
              />
            )}
          </div>
        </div>
      </div>
    </QueryGuard>
  );
}
