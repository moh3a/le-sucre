export const PROMOTION_CACHE = {
  active: () => "promo:active:v1",
  flash: () => "promo:flash:active:v1",
  cart: (user_key: string, hash: string) => `promo:cart:${user_key}:${hash}`,
  analytics: (promotion_id: string) => `promo:analytics:${promotion_id}`,
} as const;

export const PROMOTION_CACHE_TTL = {
  /** Active/flash promotions list: short — promotions toggle frequently */
  active: 120,
  /** Flash sales: very short — start/end times must be accurate */
  flash: 30,
  /** Per-cart discount computation: 2 min */
  cart: 120,
} as const;
