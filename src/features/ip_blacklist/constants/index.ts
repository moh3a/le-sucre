export const BLACKLIST_CACHE_TTL = 300; // 5 minutes

export const BLACKLIST_PAGINATION = {
  default_limit: 20,
  max_limit: 100,
} as const;

export const BLACKLIST_PERMISSIONS = {
  view: "blacklist:view",
  create: "blacklist:create",
  update: "blacklist:update",
  delete: "blacklist:delete",
} as const;
