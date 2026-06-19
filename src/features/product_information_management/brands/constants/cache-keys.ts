export const BRAND_CACHE_KEYS = {
  list: "brands:list" as const,
  active: "brands:active" as const,
  by_id: (id: string) => `brands:${id}` as const,
};
