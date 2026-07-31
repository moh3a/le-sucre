export const FORECAST_CACHE = {
  sku: (sku_id: string, wh = "default") => `forecast:sku:${sku_id}:${wh}`,
  dashboard: (hash: string) => `forecast:dashboard:${hash}`,
  alerts_open: () => `forecast:alerts:open`,
} as const;
export const FORECAST_CACHE_TTL = { sku: 900, dashboard: 300, alerts: 120 } as const;
