export const RECOMMENDATION_CACHE = {
  similar: (product_id: string, locale: string) => `rec:similar:${product_id}:${locale}`,
  related: (product_id: string, locale: string) => `rec:related:${product_id}:${locale}`,
  fbt: (product_id: string, locale: string) => `rec:fbt:${product_id}:${locale}`,
  trending: (period: string, locale: string) => `rec:trending:${period}:${locale}`,
  for_you: (user_id: string, locale: string) => `rec:foryou:${user_id}:${locale}`,
  recent: (key: string) => `rec:recent:${key}`,
} as const;

export const RECOMMENDATION_CACHE_TTL = {
  default: 600,
  trending: 300,
  recent: 120,
} as const;
