"use client";

import * as React from "react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { CatalogSearchBar } from "./catalog-search-bar";
import { CatalogSortSelect } from "./catalog-sort-select";
import { CatalogFilterSidebar } from "./catalog-filter-sidebar";
import { CatalogProductGrid } from "./catalog-product-grid";
import { CatalogPagination } from "./catalog-pagination";
import type { CatalogSort } from "../types";

import type { CatalogSearchInput, CatalogFacetsInput } from "../models/search.dto";

interface CatalogSearchPageClientProps {
  locale: "fr" | "en";
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
  // Use nuqs to manage URL-synchronized state
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
      shallow: false, // Update browser history
    },
  );

  // Extract nested properties filters
  const [selectedProperties, setSelectedProperties] = React.useState<Record<string, string[]>>(
    (initial?.properties as Record<string, string[]>) ?? {},
  );

  const searchInput: CatalogSearchInput = {
    q: params.q || undefined,
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
    category_id,
    brand_ids: params.brand.length ? params.brand : undefined,
    price_min: 0,
    price_max: params.price_max,
    in_stock_only: params.in_stock,
    properties: Object.keys(selectedProperties).length ? selectedProperties : undefined,
    locale,
  };

  // TRPC queries
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

  return (
    <QueryGuard query={search_query}>
    <div className="font-moya mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-[#4d4c20]/15 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-orla text-3xl text-[#4d4c20]">
            {category_name ? category_name : "Tous nos délices"}
          </h1>
          <p className="text-secondary/60 mt-1 text-sm">
            {searchResult?.meta.total_records ?? 0} produit(s) trouvé(s)
          </p>
        </div>

        {/* Sorting Dropdown */}
        <CatalogSortSelect
          value={params.sort as CatalogSort}
          onChange={(sort) => setParams({ sort, page: 1 })}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
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

        {/* Search Results & Pagination */}
        <div className="space-y-8 lg:col-span-3">
          {/* Real-time search bar */}
          <div className="flex items-center justify-between rounded-2xl border border-[#4d4c20]/10 bg-[#fff3e3]/30 p-4">
            <CatalogSearchBar
              value={params.q}
              onChange={(q) => setParams({ q, page: 1 })}
              placeholder={category_name ? `Rechercher dans ${category_name}...` : undefined}
            />
          </div>

          {/* Grid Products */}
          <CatalogProductGrid products={searchResult?.items ?? []} isLoading={isSearchLoading} />

          {/* Pagination */}
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
