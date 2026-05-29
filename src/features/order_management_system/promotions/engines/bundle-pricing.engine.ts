import type { CartLineForPromo } from "../types";

export function compute_bundle_discount(
  bundle: {
    bundle_type: string;
    bundle_price?: string | null;
    discount_percent?: string | null;
    buy_quantity?: number | null;
    get_quantity?: number | null;
    items: Array<{ product_id?: string | null; sku_id?: string | null; quantity: number }>;
  },
  lines: CartLineForPromo[],
) {
  const matched = bundle.items.every((bi) => {
    const qty = lines
      .filter(
        (l) =>
          (bi.sku_id && l.sku_id === bi.sku_id) ||
          (!bi.sku_id && bi.product_id && l.product_id === bi.product_id),
      )
      .reduce((s, l) => s + l.quantity, 0);
    return qty >= bi.quantity;
  });

  if (!matched) return 0;

  const bundle_lines = lines.filter((l) =>
    bundle.items.some(
      (bi) =>
        (bi.sku_id && bi.sku_id === l.sku_id) ||
        (!bi.sku_id && bi.product_id && bi.product_id === l.product_id),
    ),
  );

  const subtotal = bundle_lines.reduce((s, l) => s + Number(l.line_total), 0);

  if (bundle.bundle_type === "fixed_price" && bundle.bundle_price) {
    return Math.max(0, subtotal - Number(bundle.bundle_price));
  }
  if (bundle.bundle_type === "percent_off" && bundle.discount_percent) {
    return (subtotal * Number(bundle.discount_percent)) / 100;
  }
  if (bundle.bundle_type === "buy_x_get_y") {
    const qty = bundle_lines.reduce((s, l) => s + l.quantity, 0);
    const buy = bundle.buy_quantity ?? 1;
    const get = bundle.get_quantity ?? 1;
    const sets = Math.floor(qty / (buy + get));
    const cheapest = Math.min(...bundle_lines.map((l) => Number(l.unit_price)));
    return cheapest * get * sets;
  }
  return 0;
}
