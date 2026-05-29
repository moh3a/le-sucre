export const PROMOTION_CACHE = {
  active: () => "promo:active:v1",
  flash: () => "promo:flash:active:v1",
  cart: (user_key: string, hash: string) => `promo:cart:${user_key}:${hash}`,
} as const;
