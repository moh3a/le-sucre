import type { CartLineForPromo, CartDiscountResult } from "../types";

export type PromotionContext = {
  user_id?: string | null;
  promo_code?: string;
  shipping_cost: number;
};

export interface PromotionProvider {
  readonly name: string;
  compute_cart_discounts(
    lines: CartLineForPromo[],
    ctx: PromotionContext,
  ): Promise<CartDiscountResult>;
}
