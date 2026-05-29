import "server-only";
import { cart_discount_service } from "@/features/order_management_system/promotions/services/cart-discount.service";

export type CheckoutLine = {
  sku_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type CheckoutTotals = {
  subtotal: string;
  discount_total: string;
  tax_total: string;
  shipping_total: string;
  grand_total: string;
  adjustments: Array<{ type: string; label: string; amount: string }>;
  applied_promotions?: Array<{
    promotion_id: string;
    promo_code_id?: string | null;
    label: string;
    amount: number;
    type: string;
  }>;
  flash_prices?: Record<string, string>;
};

function money(n: number) {
  return n.toFixed(2);
}

export class CheckoutEngine {
  compute_lines(lines: CheckoutLine[]) {
    const subtotal = lines.reduce((s, l) => s + Number(l.line_total), 0);
    return { subtotal: money(subtotal) };
  }

  async compute(input: {
    lines: CheckoutLine[];
    discount_code?: string;
    shipping_cost: number;
    tax_rate?: number;
    user_id?: string | null;
  }): Promise<CheckoutTotals> {
    const { subtotal } = this.compute_lines(input.lines);
    const sub_num = Number(subtotal);

    const promo = await cart_discount_service.apply({
      lines: input.lines,
      user_id: input.user_id ?? null,
      promo_code: input.discount_code,
      shipping_cost: input.shipping_cost ?? 0,
    });

    const after_discount = sub_num - Number(promo.discount_total);
    const tax_rate = input.tax_rate ?? 0;
    const tax_total = after_discount * tax_rate;
    const shipping_total = promo.free_shipping ? 0 : (input.shipping_cost ?? 0);
    const grand = after_discount + tax_total + shipping_total;

    const adjustments = [
      ...promo.adjustments,
      ...(tax_total > 0 ? [{ type: "tax", label: "TVA", amount: money(tax_total) }] : []),
      ...(shipping_total > 0
        ? [{ type: "shipping", label: "Livraison", amount: money(shipping_total) }]
        : []),
    ];

    return {
      subtotal,
      discount_total: promo.discount_total,
      tax_total: money(tax_total),
      shipping_total: money(shipping_total),
      grand_total: money(grand),
      adjustments,
      applied_promotions: promo.applied,
      flash_prices: promo.flash_prices,
    };
  }
}

export const checkout_engine = new CheckoutEngine();
