import { default_locale } from "@/i18n/config";
import type { CatalogSearchInput } from "../models/search.dto";

function locale_prefix(locale: string): string {
  return locale === default_locale ? "" : `/${locale}`;
}

export function build_catalog_search_path(locale: string, params: Partial<CatalogSearchInput>) {
  const sp = new URLSearchParams();

  if (params.q) sp.set("q", params.q);
  if (params.sort && params.sort !== "relevance") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.brand_ids?.length) sp.set("brand", params.brand_ids.join(","));
  if (params.price_min != null) sp.set("price_min", String(params.price_min));
  if (params.price_max != null) sp.set("price_max", String(params.price_max));
  if (params.in_stock_only) sp.set("in_stock", "1");
  if (params.is_featured) sp.set("featured", "1");
  if (params.properties) {
    for (const [code, values] of Object.entries(params.properties)) {
      sp.set(`prop_${code}`, values.join(","));
    }
  }

  const qs = sp.toString();
  return `${locale_prefix(locale)}/search${qs ? `?${qs}` : ""}`;
}

export function build_category_catalog_path(
  locale: string,
  category_slug: string,
  params?: Partial<CatalogSearchInput>,
) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.sort && params.sort !== "relevance") sp.set("sort", params.sort);
  if (params?.page && params.page > 1) sp.set("page", String(params.page));
  if (params?.brand_ids?.length) sp.set("brand", params.brand_ids.join(","));
  if (params?.price_min != null) sp.set("price_min", String(params.price_min));
  if (params?.price_max != null) sp.set("price_max", String(params.price_max));
  if (params?.in_stock_only) sp.set("in_stock", "1");
  if (params?.properties) {
    for (const [code, values] of Object.entries(params.properties)) {
      sp.set(`prop_${code}`, values.join(","));
    }
  }
  const qs = sp.toString();
  return `${locale_prefix(locale)}/c/${category_slug}${qs ? `?${qs}` : ""}`;
}

/** Parse Next.js searchParams → catalog DTO fields */
export function parse_catalog_search_params(
  search_params: Record<string, string | string[] | undefined>,
) {
  const get = (k: string) => {
    const v = search_params[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const properties: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(search_params)) {
    if (!key.startsWith("prop_")) continue;
    const code = key.slice(5);
    const val = Array.isArray(raw) ? raw[0] : raw;
    if (!val) continue;
    properties[code] = val.split(",").filter(Boolean);
  }

  const brand_raw = get("brand");
  return {
    q: get("q") ?? undefined,
    sort: (get("sort") as CatalogSearchInput["sort"]) ?? undefined,
    page: get("page") ? Number(get("page")) : undefined,
    brand_ids: brand_raw ? brand_raw.split(",").filter(Boolean) : undefined,
    price_min: get("price_min") ? Number(get("price_min")) : undefined,
    price_max: get("price_max") ? Number(get("price_max")) : undefined,
    in_stock_only: get("in_stock") === "1",
    is_featured: get("featured") === "1" ? true : undefined,
    properties: Object.keys(properties).length ? properties : undefined,
  };
}
