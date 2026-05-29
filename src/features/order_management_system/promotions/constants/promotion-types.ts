export const PROMOTION_TYPE = {
  promo_code: "promo_code",
  automatic: "automatic",
  flash_sale: "flash_sale",
  bundle: "bundle",
  customer: "customer",
} as const;

export const PROMOTION_STATUS = {
  draft: "draft",
  scheduled: "scheduled",
  active: "active",
  paused: "paused",
  expired: "expired",
} as const;

export const DISCOUNT_SCOPE = {
  cart: "cart",
  category: "category",
  product: "product",
  sku: "sku",
  customer: "customer",
  shipping: "shipping",
} as const;

export const DISCOUNT_TYPE = {
  percent: "percent",
  fixed: "fixed",
  free_shipping: "free_shipping",
  buy_x_get_y: "buy_x_get_y",
  bundle_price: "bundle_price",
} as const;
