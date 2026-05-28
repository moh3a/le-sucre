import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { discount_codes } from "../schema";
import { ValidationError } from "@/lib/error_handling";

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
};

function money(n: number) {
  return n.toFixed(2);
}

export class CheckoutEngine {
  compute_lines(lines: CheckoutLine[]) {
    const subtotal = lines.reduce((s, l) => s + Number(l.line_total), 0);
    return { subtotal: money(subtotal) };
  }

  async resolve_discount(subtotal: number, code?: string) {
    if (!code) return { discount_total: "0.00", label: null as string | null };
    const [row] = await db
      .select()
      .from(discount_codes)
      .where(eq(discount_codes.code, code.toUpperCase()))
      .limit(1);
    if (!row || !row.is_active) throw new ValidationError("Code promo invalide");
    if (row.min_subtotal && subtotal < Number(row.min_subtotal)) {
      throw new ValidationError("Montant minimum non atteint");
    }
    const amount =
      row.type === "percent" ? (subtotal * Number(row.value)) / 100 : Number(row.value);
    return { discount_total: money(Math.min(amount, subtotal)), label: row.code };
  }

  async compute(input: {
    lines: CheckoutLine[];
    discount_code?: string;
    shipping_cost: number;
    tax_rate?: number;
  }): Promise<CheckoutTotals> {
    const { subtotal } = this.compute_lines(input.lines);
    const sub_num = Number(subtotal);

    const discount = await this.resolve_discount(sub_num, input.discount_code);
    const after_discount = sub_num - Number(discount.discount_total);

    const tax_rate = input.tax_rate ?? 0;
    const tax_total = after_discount * tax_rate;
    const shipping_total = input.shipping_cost ?? 0;
    const grand = after_discount + tax_total + shipping_total;

    const adjustments = [
      ...(Number(discount.discount_total) > 0
        ? [
            {
              type: "discount",
              label: discount.label ?? "discount",
              amount: `-${discount.discount_total}`,
            },
          ]
        : []),
      ...(tax_total > 0 ? [{ type: "tax", label: "TVA", amount: money(tax_total) }] : []),
      ...(shipping_total > 0
        ? [{ type: "shipping", label: "Livraison", amount: money(shipping_total) }]
        : []),
    ];

    return {
      subtotal,
      discount_total: discount.discount_total,
      tax_total: money(tax_total),
      shipping_total: money(shipping_total),
      grand_total: money(grand),
      adjustments,
    };
  }
}

export const checkout_engine = new CheckoutEngine();
