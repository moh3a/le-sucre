export type CatalogSort = "relevance" | "newest" | "price_asc" | "price_desc" | "featured";

export type CatalogProductCard = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  currency: string;
  min_price: string;
  max_price: string | null;
  is_featured: boolean;
  in_stock: boolean;
  brand_name: string | null;
  relevance_score?: number;
};

export type CatalogSearchMeta = {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  has_more: boolean;
};

export type CatalogFacetBrand = { id: string; name: string; slug: string; count: number };

export type CatalogFacetProperty = {
  code: string;
  name: string;
  values: Array<{ code: string; label: string; count: number }>;
};

export type CatalogFacets = {
  brands: CatalogFacetBrand[];
  price: { min: number; max: number };
  properties: CatalogFacetProperty[];
};

export type SearchSuggestion = {
  type: "product" | "brand" | "category";
  text: string;
  slug: string;
  image_url?: string | null;
};

export type TrendingSearchTerm = {
  query: string;
  locale: string;
  count: number;
};

export type ResolvedCatalogFilters = {
  locale: string;
  category_ids?: string[];
  brand_ids?: string[];
  price_min?: number;
  price_max?: number;
  property_filters: Array<{ property_code: string; value_codes: string[] }>;
  in_stock_only: boolean;
  is_featured?: boolean;
  fulltext_product_ids?: string[];
  fulltext_scores?: Map<string, number>;
};
