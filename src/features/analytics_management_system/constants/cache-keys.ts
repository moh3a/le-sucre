export const ANALYTICS_CACHE = {
  overview: (from: string, to: string) => `analytics:overview:${from}:${to}`,
  products: (from: string, to: string) => `analytics:products:${from}:${to}`,
  sales: (from: string, to: string) => `analytics:sales:${from}:${to}`,
  funnel: (from: string, to: string) => `analytics:funnel:${from}:${to}`,
  realtime: () => `analytics:realtime:snapshot`,
} as const;

export const ANALYTICS_CACHE_TTL = {
  dashboard: 300,
  realtime: 30,
} as const;
