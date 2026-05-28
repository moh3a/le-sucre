export const REVIEW_CACHE = {
  summary: (product_id: string) => `reviews:summary:${product_id}`,
  list: (product_id: string, hash: string) => `reviews:list:${product_id}:${hash}`,
  user_history: (user_id: string, page: number) => `reviews:user:${user_id}:${page}`,
} as const;

export const REVIEW_CACHE_TTL = {
  summary: 600,
  list: 180,
  user_history: 120,
} as const;
