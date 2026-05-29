export type CartLineForPromo = {
  sku_id: string;
  product_id: string;
  category_id?: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type AppliedDiscount = {
  promotion_id: string;
  promo_code_id?: string | null;
  label: string;
  amount: number;
  type: string;
  free_shipping?: boolean;
};

export type CartDiscountResult = {
  subtotal: string;
  discount_total: string;
  free_shipping: boolean;
  adjustments: Array<{ type: string; label: string; amount: string }>;
  applied: AppliedDiscount[];
  flash_prices: Record<string, string>; // sku_id -> flash_price
};
