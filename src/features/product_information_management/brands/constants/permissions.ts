import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

export const BRAND_PERMISSIONS = {
  brands_read: PERMISSIONS.brands_read,
  brands_write: PERMISSIONS.brands_write,
} as const;

export type BrandPermissionName = (typeof BRAND_PERMISSIONS)[keyof typeof BRAND_PERMISSIONS];
