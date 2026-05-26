// cache-keys.ts
export const CATEGORY_CACHE = {
  admin_tree: "category:admin:tree",
  storefront_tree: "category:storefront:tree",
  descendants: (id: string) => `category:descendants:${id}`,
  ancestors: (id: string) => `category:ancestors:${id}`,
} as const;

export const CATEGORY_CACHE_TTL_SEC = 300;
