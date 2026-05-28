"use client";

import { useQuery } from "@tanstack/react-query";
import type { CatalogSearchInput } from "../models/search.dto";

async function fetch_catalog_search(params: CatalogSearchInput) {
  const sp = new URLSearchParams();
  sp.set("locale", params.locale);
  if (params.q) sp.set("q", params.q);
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  sp.set("sort", params.sort);
  if (params.category_slug) sp.set("category_slug", params.category_slug);
  if (params.category_id) sp.set("category_id", params.category_id);
  if (params.brand_ids?.length) sp.set("brand", params.brand_ids.join(","));
  if (params.price_min != null) sp.set("price_min", String(params.price_min));
  if (params.price_max != null) sp.set("price_max", String(params.price_max));
  if (params.in_stock_only) sp.set("in_stock", "1");
  if (params.properties) sp.set("properties", JSON.stringify(params.properties));

  const res = await fetch(`/api/storefront/catalog/search?${sp.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "Search failed");
  return json.data as {
    items: Array<{
      id: string;
      slug: string;
      name: string;
      image_url: string | null;
      min_price: string;
      max_price: string | null;
      currency: string;
      in_stock: boolean;
      brand_name: string | null;
    }>;
    meta: { page: number; total_pages: number; total_records: number; has_more: boolean };
  };
}

export function useCatalogSearch(params: CatalogSearchInput) {
  return useQuery({
    queryKey: ["catalog-search", params],
    queryFn: () => fetch_catalog_search(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}
