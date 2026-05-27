export const PRODUCT_CACHE = {
  by_id: (id: string) => `product:${id}`,
  by_slug: (slug: string, locale: string) => `product:slug:${slug}:${locale}`,
  price_range: (product_id: string) => `product:price_range:${product_id}`,
} as const;

export const PRODUCT_CACHE_TTL_SEC = 120;
