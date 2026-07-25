export const AUDIT_ACTION = {
  BRAND_CREATED: "brand.create",
  BRAND_UPDATED: "brand.update",
  BRAND_SOFT_DELETED: "brand.soft_delete",
  BRAND_RESTORED: "brand.restore",
  BRAND_FORCE_DELETED: "brand.force_delete",
  PRODUCT_CREATED: "product.create",
  PRODUCT_UPDATED: "product.update",
  PRODUCT_REMOVED: "product.remove",
  PRODUCT_DUPLICATED: "product.duplicate",
  PRODUCT_BULK_ACTIVATED: "product.bulk_activate",
  PRODUCT_BULK_DEACTIVATED: "product.bulk_deactivate",
  PRODUCT_BULK_DELETED: "product.bulk_delete",
  PRODUCT_BULK_CATEGORY_ASSIGNED: "product.bulk_assign_category",
} as const;

export type ProductInformationAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
