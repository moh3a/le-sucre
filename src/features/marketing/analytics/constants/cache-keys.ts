export const ANALYTICS_CACHE = {
  overview: (from: string, to: string) => `analytics:overview:${from}:${to}`,
  products: (from: string, to: string) => `analytics:products:${from}:${to}`,
  productDetail: (product_id: string, from: string, to: string) =>
    `analytics:product_detail:${product_id}:${from}:${to}`,
  search: (from: string, to: string, limit: number) => `analytics:search:${from}:${to}:${limit}`,
} as const;

export const ANALYTICS_CACHE_TTL = {
  dashboard: 300,
} as const;
