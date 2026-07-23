import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

export const PRODUCT_PERMISSIONS = {
  products_read: PERMISSIONS.products_read,
  products_write: PERMISSIONS.products_write,
  products_delete: PERMISSIONS.products_delete,
  products_publish: PERMISSIONS.products_publish,
  categories_read: PERMISSIONS.categories_read,
  categories_write: PERMISSIONS.categories_write,
  brands_read: PERMISSIONS.brands_read,
  brands_write: PERMISSIONS.brands_write,
  variants_read: PERMISSIONS.variants_read,
  variants_write: PERMISSIONS.variants_write,
  media_read: PERMISSIONS.media_read,
  media_write: PERMISSIONS.media_write,
} as const;

export type ProductPermissionName = (typeof PRODUCT_PERMISSIONS)[keyof typeof PRODUCT_PERMISSIONS];
