export const PERMISSIONS = {
  // Users & Roles
  users_read: "users:read",
  users_write: "users:write",
  roles_manage: "roles:manage",
  audit_read: "audit:read",

  // Orders
  orders_read: "orders:read",
  orders_write: "orders:write",

  // Products
  products_read: "products:read",
  products_write: "products:write",
  products_delete: "products:delete",
  products_publish: "products:publish",

  // Variants
  variants_read: "variants:read",
  variants_write: "variants:write",

  // Media
  media_read: "media:read",
  media_write: "media:write",

  // Delivery
  delivery_manage: "delivery:manage",
  storefront_account: "storefront:account",

  // Brands
  brands_read: "brands:read",
  brands_write: "brands:write",

  // Categories
  categories_read: "categories:read",
  categories_write: "categories:write",

  // Preorders
  preorders_read: "preorders:read",
  preorders_write: "preorders:write",

  // Inventory
  inventory_read: "inventory:read",
  inventory_write: "inventory:write",
  inventory_forecast_read: "inventory:forecast:read",
  inventory_forecast_write: "inventory:forecast:write",

  // Reviews
  reviews_read: "reviews:read",
  reviews_moderate: "reviews:moderate",

  // Promotions
  promotions_read: "promotions:read",
  promotions_write: "promotions:write",

  // Analytics
  analytics_read: "analytics:read",

  // Customers
  customers_read: "customers:read",

  // Campaigns
  campaigns_read: "campaigns:read",
  campaigns_write: "campaigns:write",

  // Invoices
  invoices_read: "invoices:read",
  invoices_write: "invoices:write",

  // Shipping
  shipping_read: "shipping:read",
  shipping_write: "shipping:write",

  // Settings
  settings_read: "settings:read",
  settings_write: "settings:write",

  // Operations workflow
  escalations_read: "escalations:read",
  escalations_write: "escalations:write",
  holds_read: "holds:read",
  holds_write: "holds:write",
  cancellations_read: "cancellations:read",
  cancellations_write: "cancellations:write",
  follow_ups_read: "follow_ups:read",
  follow_ups_write: "follow_ups:write",
  support_cases_read: "support_cases:read",
  support_cases_write: "support_cases:write",

  // Warranty
  warranty_read: "warranty:read",
  warranty_write: "warranty:write",

  // Payment verification
  payment_verification_read: "payment_verification:read",
  payment_verification_write: "payment_verification:write",

  // Refunds
  refund_read: "refund:read",
  refund_write: "refund:write",

  // Tasks & Notifications
  tasks_read: "tasks:read",
  tasks_write: "tasks:write",
  notifications_read: "notifications:read",

  // Payments
  payments_read: "payments:read",
  payments_write: "payments:write",

  // Wishlists
  wishlists_read: "wishlists:read",
  wishlists_write: "wishlists:write",
  wishlists_analytics: "wishlists:analytics",

  // Blacklist
  blacklist_view: "blacklist:view",
  blacklist_create: "blacklist:create",
  blacklist_update: "blacklist:update",
  blacklist_delete: "blacklist:delete",

  // Export
  products_export: "products:export",
  orders_export: "orders:export",
  customers_export: "customers:export",
  reviews_export: "reviews:export",
  analytics_export: "analytics:export",
  inventory_export: "inventory:export",
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
    PERMISSIONS.products_publish,
    PERMISSIONS.variants_read,
    PERMISSIONS.variants_write,
    PERMISSIONS.media_read,
    PERMISSIONS.media_write,
    PERMISSIONS.audit_read,
    PERMISSIONS.brands_read,
    PERMISSIONS.categories_read,
    PERMISSIONS.categories_write,
    PERMISSIONS.inventory_read,
    PERMISSIONS.inventory_write,
    PERMISSIONS.reviews_read,
    PERMISSIONS.reviews_moderate,
    PERMISSIONS.analytics_read,
    PERMISSIONS.customers_read,
    PERMISSIONS.campaigns_read,
    PERMISSIONS.campaigns_write,
    PERMISSIONS.invoices_read,
    PERMISSIONS.shipping_read,
    PERMISSIONS.settings_read,
    PERMISSIONS.escalations_read,
    PERMISSIONS.escalations_write,
    PERMISSIONS.holds_read,
    PERMISSIONS.holds_write,
    PERMISSIONS.cancellations_read,
    PERMISSIONS.cancellations_write,
    PERMISSIONS.follow_ups_read,
    PERMISSIONS.follow_ups_write,
    PERMISSIONS.support_cases_read,
    PERMISSIONS.support_cases_write,
    PERMISSIONS.warranty_read,
    PERMISSIONS.warranty_write,
    PERMISSIONS.tasks_read,
    PERMISSIONS.tasks_write,
    PERMISSIONS.notifications_read,
    PERMISSIONS.payments_read,
    PERMISSIONS.payments_write,
    PERMISSIONS.wishlists_read,
    PERMISSIONS.wishlists_analytics,
    PERMISSIONS.blacklist_view,
    PERMISSIONS.products_export,
    PERMISSIONS.orders_export,
    PERMISSIONS.customers_export,
    PERMISSIONS.reviews_export,
  ],
  operator: [
    PERMISSIONS.orders_read,
    PERMISSIONS.orders_write,
    PERMISSIONS.products_read,
    PERMISSIONS.products_write,
    PERMISSIONS.variants_read,
    PERMISSIONS.variants_write,
    PERMISSIONS.media_read,
    PERMISSIONS.media_write,
    PERMISSIONS.brands_read,
    PERMISSIONS.categories_read,
    PERMISSIONS.inventory_read,
    PERMISSIONS.inventory_write,
    PERMISSIONS.shipping_read,
    PERMISSIONS.shipping_write,
    PERMISSIONS.escalations_read,
    PERMISSIONS.escalations_write,
    PERMISSIONS.holds_read,
    PERMISSIONS.holds_write,
    PERMISSIONS.cancellations_read,
    PERMISSIONS.cancellations_write,
    PERMISSIONS.follow_ups_read,
    PERMISSIONS.follow_ups_write,
    PERMISSIONS.support_cases_read,
    PERMISSIONS.support_cases_write,
    PERMISSIONS.tasks_read,
    PERMISSIONS.tasks_write,
    PERMISSIONS.notifications_read,
    PERMISSIONS.wishlists_read,
    PERMISSIONS.wishlists_write,
  ],
  delivery_person: [
    PERMISSIONS.delivery_manage,
    PERMISSIONS.orders_read,
    PERMISSIONS.shipping_read,
    PERMISSIONS.notifications_read,
  ],
  customer: [PERMISSIONS.storefront_account, PERMISSIONS.wishlists_read, PERMISSIONS.wishlists_write],
};
