// TODO complete permissions
export const PERMISSIONS = {
  users_read: "users:read",
  users_write: "users:write",
  roles_manage: "roles:manage",
  audit_read: "audit:read",
  orders_read: "orders:read",
  orders_write: "orders:write",
  products_read: "products:read",
  products_write: "products:write",
  delivery_manage: "delivery:manage",
  storefront_account: "storefront:account",
  categories_read: "categories:read",
  categories_write: "categories:write",
  inventory_read: "inventory:read",
  inventory_write: "inventory:write",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSION_MAP: Record<string, PermissionName[]> = {
  admin: Object.values(PERMISSIONS),
  moderator: [
    PERMISSIONS.users_read,
    PERMISSIONS.orders_read,
    PERMISSIONS.orders_write,
    PERMISSIONS.products_read,
    PERMISSIONS.products_write,
    PERMISSIONS.audit_read,
    PERMISSIONS.categories_read,
    PERMISSIONS.categories_write,
    PERMISSIONS.inventory_read,
    PERMISSIONS.inventory_write,
  ],
  operator: [
    PERMISSIONS.orders_read,
    PERMISSIONS.orders_write,
    PERMISSIONS.products_read,
    PERMISSIONS.products_write,
    PERMISSIONS.categories_read,
    PERMISSIONS.inventory_read,
    PERMISSIONS.inventory_write,
  ],
  delivery_person: [PERMISSIONS.delivery_manage, PERMISSIONS.orders_read],
  customer: [PERMISSIONS.storefront_account],
};
