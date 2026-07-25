export const AUDIT_ACTION = {
  BRAND_CREATED: "brand.create",
  BRAND_UPDATED: "brand.update",
  BRAND_SOFT_DELETED: "brand.soft_delete",
  BRAND_RESTORED: "brand.restore",
  BRAND_FORCE_DELETED: "brand.force_delete",
} as const;

export type ProductInformationAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
