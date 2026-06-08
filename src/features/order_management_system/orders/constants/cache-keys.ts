/**
 * Redis cache key factory for the orders feature.
 * Pattern: order:<entity>:<id>[:<subkey>]
 *
 * NOTE: Order detail caching is intentionally kept minimal — orders are
 * admin-facing and consistency is more important than read performance.
 * These keys are provided for future use (e.g. storefront order tracking).
 */
export const ORDER_CACHE = {
  /** Full order detail for customer-facing tracking page */
  detail: (order_id: string) => `order:detail:${order_id}`,

  /** Customer order list (paginated, keyed by user + page + status) */
  customer_list: (user_id: string, page: number, status?: string) =>
    `order:list:user:${user_id}:p${page}:${status ?? "all"}`,

  /** Admin order stats dashboard */
  admin_stats: () => `order:admin:stats`,

  /** Admin chart data (revenue/orders growth) */
  admin_charts: (days: number) => `order:admin:charts:${days}d`,

  /** Idempotency key lock (prevent duplicate order creation) */
  idempotency: (key: string) => `order:idempotency:${key}`,
} as const;

export const ORDER_CACHE_TTL = {
  /** Order detail for storefront tracking: 30 seconds */
  detail: 30,

  /** Customer list: 1 minute */
  customer_list: 60,

  /** Admin stats: 5 minutes */
  admin_stats: 300,

  /** Admin charts: 10 minutes */
  admin_charts: 600,

  /** Idempotency lock: matches order processing timeout */
  idempotency: 86_400, // 24 hours
} as const;
