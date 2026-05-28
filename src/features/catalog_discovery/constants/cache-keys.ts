export const CATALOG_CACHE = {
  search: (hash: string) => `catalog:search:v1:${hash}`,
  facets: (hash: string) => `catalog:facets:v1:${hash}`,
  category_ids: (category_id: string) => `catalog:cat_ids:${category_id}`,
} as const;

export const CATALOG_CACHE_TTL = {
  search: 120,
  facets: 180,
  category_ids: 600,
} as const;
