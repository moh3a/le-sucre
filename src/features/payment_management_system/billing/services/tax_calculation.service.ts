import "server-only";
import { env } from "@/config/env";

export class TaxCalculationService {
  /**
   * Calculates detailed tax breakdown for a list of items and extra costs.
   */
  calculate_invoice_totals(params: {
    items: Array<{
      unit_price: string | number;
      quantity: number;
      tax_rate?: string | number;
    }>;
    discount_total?: string | number;
    shipping_total?: string | number;
  }) {
    const default_tax_rate = env.CHECKOUT_TAX_RATE ?? 0.19;

    let subtotal = 0;
    let tax_total = 0;

    const calculated_items = params.items.map((item) => {
      const price = Number(item.unit_price);
      const qty = item.quantity;
      const rate = item.tax_rate !== undefined ? Number(item.tax_rate) : default_tax_rate;

      const base_total = price * qty;
      const item_tax = base_total * rate;
      const line_total = base_total + item_tax;

      subtotal += base_total;
      tax_total += item_tax;

      return {
        unit_price: price.toFixed(2),
        quantity: qty,
        tax_rate: rate.toFixed(2),
        tax_amount: item_tax.toFixed(2),
        line_total: line_total.toFixed(2),
      };
    });

    const discount = Number(params.discount_total ?? 0);
    const shipping = Number(params.shipping_total ?? 0);

    // Apply discount proportionally to the grand total or subtotal
    // Here we assume grand_total = (subtotal - discount) + tax_total + shipping_total

    // Recalculate tax if tax is proportional to subtotal after discount
    // For simplicity, we keep tax relative to original item prices, or we adjust it:
    // We will follow: grand_total = subtotal - discount + tax_total + shipping_total
    const grand_total = Math.max(0, subtotal - discount + tax_total + shipping);

    return {
      items: calculated_items,
      subtotal: subtotal.toFixed(2),
      discount_total: discount.toFixed(2),
      tax_total: tax_total.toFixed(2),
      shipping_total: shipping.toFixed(2),
      grand_total: grand_total.toFixed(2),
    };
  }
}

export const tax_calculation_service = new TaxCalculationService();
