export const BRAND_PERMISSIONS = {
  brands_read: "brands:read",
  brands_write: "brands:write",
} as const;

export type BrandPermissionName = (typeof BRAND_PERMISSIONS)[keyof typeof BRAND_PERMISSIONS];
