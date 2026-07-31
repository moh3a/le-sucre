export const ANALYTICS_EVENT = {
  product_view: "product_view",
  add_to_cart: "add_to_cart",
  checkout_started: "checkout_started",
  purchase: "purchase",
  search: "search",
  click: "click",
  wishlist_add: "wishlist_add",
  recommendation_click: "recommendation_click",
  cart_abandoned: "cart_abandoned",
} as const;

export const FUNNEL_STEP = {
  view: "view",
  add_to_cart: "add_to_cart",
  checkout: "checkout",
  purchase: "purchase",
} as const;
