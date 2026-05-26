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
  ],
  operator: [
    PERMISSIONS.orders_read,
    PERMISSIONS.orders_write,
    PERMISSIONS.products_read,
    PERMISSIONS.products_write,
  ],
  delivery_person: [PERMISSIONS.delivery_manage, PERMISSIONS.orders_read],
  customer: [PERMISSIONS.storefront_account],
};
