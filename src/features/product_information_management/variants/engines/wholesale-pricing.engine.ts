import type { WholesaleRuleRow } from "../types";

export function apply_wholesale_rule(input: {
  base_unit_price: string;
  currency: string;
  quantity: number;
  rule: WholesaleRuleRow;
}): {
  unit_price: string;
  currency: string;
  source: "wholesale_rule_sku" | "wholesale_rule_product";
} {
  const base = Number(input.base_unit_price);
  if (!Number.isFinite(base))
    return {
      unit_price: input.base_unit_price,
      currency: input.currency,
      source: "wholesale_rule_product",
    };

  if (input.rule.price != null) {
    return {
      unit_price: String(input.rule.price),
      currency: input.rule.currency ?? input.currency,
      source: input.rule.sku_id ? "wholesale_rule_sku" : "wholesale_rule_product",
    };
  }

  if (input.rule.discount_percent != null) {
    const pct = Number(input.rule.discount_percent);
    const factor = Math.max(0, Math.min(100, pct)) / 100;
    const discounted = Math.max(0, base * (1 - factor));
    return {
      unit_price: discounted.toFixed(2),
      currency: input.rule.currency ?? input.currency,
      source: input.rule.sku_id ? "wholesale_rule_sku" : "wholesale_rule_product",
    };
  }

  return {
    unit_price: input.base_unit_price,
    currency: input.currency,
    source: "wholesale_rule_product",
  };
}
