export const PRODUCT_PERMISSIONS = {
  products_read: "products:read",
  products_write: "products:write",
  products_delete: "products:delete",
  products_publish: "products:publish",
  categories_read: "categories:read",
  categories_write: "categories:write",
  brands_read: "brands:read",
  brands_write: "brands:write",
  variants_read: "variants:read",
  variants_write: "variants:write",
  media_read: "media:read",
  media_write: "media:write",
} as const;

export type ProductPermissionName = (typeof PRODUCT_PERMISSIONS)[keyof typeof PRODUCT_PERMISSIONS];