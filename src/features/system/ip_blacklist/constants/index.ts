import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

export const BLACKLIST_CACHE_TTL = 300; // 5 minutes

export const BLACKLIST_PAGINATION = {
  default_limit: 20,
  max_limit: 100,
} as const;

export const BLACKLIST_PERMISSIONS = {
  view: PERMISSIONS.blacklist_view,
  create: PERMISSIONS.blacklist_create,
  update: PERMISSIONS.blacklist_update,
  delete: PERMISSIONS.blacklist_delete,
} as const;
