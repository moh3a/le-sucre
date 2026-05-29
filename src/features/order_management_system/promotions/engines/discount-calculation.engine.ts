import { DISCOUNT_TYPE, DISCOUNT_SCOPE } from "../constants/promotion-types";
import type { CartLineForPromo, AppliedDiscount } from "../types";

function money(n: number) {
  return Math.max(0, n);
}

export function apply_rule_to_lines(
  rule: {
    scope_type: string;
    scope_id: string | null;
    discount_type: string;
    discount_value: string;
    min_subtotal?: string | null;
    min_quantity?: number | null;
    max_discount_amount?: string | null;
    buy_quantity?: number | null;
    get_quantity?: number | null;
  },
  lines: CartLineForPromo[],
  subtotal: number,
): { amount: number; free_shipping: boolean } {
  if (rule.min_subtotal && subtotal < Number(rule.min_subtotal)) {
    return { amount: 0, free_shipping: false };
  }

  const scoped_lines = lines.filter((l) => {
    if (rule.scope_type === DISCOUNT_SCOPE.cart) return true;
    if (rule.scope_type === DISCOUNT_SCOPE.product) return l.product_id === rule.scope_id;
    if (rule.scope_type === DISCOUNT_SCOPE.sku) return l.sku_id === rule.scope_id;
    if (rule.scope_type === DISCOUNT_SCOPE.category) return l.category_id === rule.scope_id;
    return false;
  });

  const scoped_subtotal = scoped_lines.reduce((s, l) => s + Number(l.line_total), 0);
  const scoped_qty = scoped_lines.reduce((s, l) => s + l.quantity, 0);

  if (rule.min_quantity && scoped_qty < rule.min_quantity) {
    return { amount: 0, free_shipping: false };
  }

  if (rule.discount_type === DISCOUNT_TYPE.free_shipping) {
    return { amount: 0, free_shipping: true };
  }

  if (rule.discount_type === DISCOUNT_TYPE.buy_x_get_y) {
    const buy = rule.buy_quantity ?? 1;
    const get = rule.get_quantity ?? 1;
    const sets = Math.floor(scoped_qty / (buy + get));
    if (!sets || !scoped_lines.length) return { amount: 0, free_shipping: false };
    const cheapest = Math.min(...scoped_lines.map((l) => Number(l.unit_price)));
    return { amount: money(cheapest * get * sets), free_shipping: false };
  }

  let amount =
    rule.discount_type === DISCOUNT_TYPE.percent
      ? (scoped_subtotal * Number(rule.discount_value)) / 100
      : Number(rule.discount_value);

  if (rule.max_discount_amount) amount = Math.min(amount, Number(rule.max_discount_amount));
  return { amount: money(Math.min(amount, subtotal)), free_shipping: false };
}

export function merge_applied_discounts(
  applied: AppliedDiscount[],
  next: AppliedDiscount,
  stackable: boolean,
) {
  if (!stackable && applied.length) return applied;
  return [...applied, next];
}
