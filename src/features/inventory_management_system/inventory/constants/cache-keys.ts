/**
 * Redis cache key factory for the inventory feature.
 * Pattern: inventory:<entity>:<id>[:<subkey>]
 */
export const INVENTORY_CACHE = {
  /** Per-SKU stock level summary (available, reserved, on-hand) */
  sku_level: (sku_id: string) => `inventory:level:sku:${sku_id}`,

  /** Per-product aggregated stock summary (sum across all SKUs) */
  product_summary: (product_id: string) => `inventory:summary:product:${product_id}`,

  /** Global low-stock alert list (admin dashboard widget) */
  low_stock_list: () => `inventory:low_stock_list`,

  /** Global out-of-stock list */
  out_of_stock_list: () => `inventory:out_of_stock_list`,

  /** Per-SKU reservation lock key (used with SET NX EX for atomic reservation) */
  reservation_lock: (sku_id: string) => `inventory:lock:sku:${sku_id}`,

  /** Admin inventory dashboard aggregate stats */
  dashboard_stats: () => `inventory:dashboard:stats`,
} as const;

export const INVENTORY_CACHE_TTL = {
  /** SKU level: short TTL — stock changes frequently */
  sku_level: 30,

  /** Product summary: slightly longer — aggregated view */
  product_summary: 60,

  /** Low/out-of-stock lists: refreshed on stock sync */
  stock_lists: 120,

  /** Dashboard stats aggregate: 5 min */
  dashboard_stats: 300,

  /** Reservation lock: max hold time in seconds */
  reservation_lock: 30,
} as const;
