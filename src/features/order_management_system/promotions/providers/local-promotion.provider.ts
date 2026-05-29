import "server-only";

import type { PromotionProvider } from "./promotion-provider.interface";
import { promotion_repository } from "../repositories/promotion.repository";
import { promo_code_repository } from "../repositories/promo-code.repository";
import { flash_sale_repository } from "../repositories/flash-sale.repository";
import { bundle_repository } from "../repositories/bundle.repository";
import { apply_rule_to_lines } from "../engines/discount-calculation.engine";
import {
  assert_promo_code_window,
  assert_usage_limits,
} from "../engines/promo-code-validation.engine";
import { compute_bundle_discount } from "../engines/bundle-pricing.engine";
import { is_flash_sale_live } from "../engines/flash-sale.engine";
import { ValidationError } from "@/lib/error_handling";

export const local_promotion_provider: PromotionProvider = {
  name: "local",
  async compute_cart_discounts(lines, ctx) {
    const subtotal_num = lines.reduce((s, l) => s + Number(l.line_total), 0);
    let discount_total = 0;
    let free_shipping = false;
    const applied = [];
    const flash_prices: Record<string, string> = {};
    const adjustments = [];

    // 1) Active flash sale prices override unit pricing context
    const active_flash = await flash_sale_repository.list_active_with_items();
    for (const sale of active_flash) {
      if (!is_flash_sale_live(sale)) continue;
      for (const item of sale.items) {
        flash_prices[item.sku_id] = String(item.flash_price);
      }
    }

    // 2) Automatic + customer promotions
    const auto_promos = await promotion_repository.list_active_automatic(ctx.user_id);
    for (const promo of auto_promos) {
      for (const rule of promo.rules) {
        const result = apply_rule_to_lines(rule, lines, subtotal_num - discount_total);
        if (result.amount <= 0 && !result.free_shipping) continue;
        discount_total += result.amount;
        free_shipping ||= result.free_shipping;
        applied.push({
          promotion_id: promo.id,
          label: promo.name,
          amount: result.amount,
          type: rule.discount_type,
          free_shipping: result.free_shipping,
        });
        if (!promo.is_stackable) break;
      }
    }

    // 3) Bundles
    const bundles = await bundle_repository.list_active();
    for (const bundle of bundles) {
      const amount = compute_bundle_discount(bundle, lines);
      if (amount <= 0) continue;
      discount_total += amount;
      applied.push({
        promotion_id: bundle.promotion_id,
        label: bundle.name,
        amount,
        type: "bundle",
      });
    }

    // 4) Promo code
    if (ctx.promo_code) {
      const code_row = await promo_code_repository.find_by_code(ctx.promo_code);
      if (!code_row) throw new ValidationError("Code promo invalide");
      assert_promo_code_window(code_row);
      const customer_usage = ctx.user_id
        ? await promo_code_repository.count_customer_usage(code_row.id, ctx.user_id)
        : 0;
      assert_usage_limits({
        usage_limit: code_row.usage_limit,
        usage_count: code_row.usage_count,
        per_customer_limit: code_row.per_customer_limit,
        customer_usage_count: customer_usage,
      });

      const promo = await promotion_repository.get_with_rules(code_row.promotion_id);
      for (const rule of promo.rules) {
        const result = apply_rule_to_lines(rule, lines, subtotal_num - discount_total);
        discount_total += result.amount;
        free_shipping ||= result.free_shipping;
        applied.push({
          promotion_id: promo.id,
          promo_code_id: code_row.id,
          label: code_row.code,
          amount: result.amount,
          type: rule.discount_type,
          free_shipping: result.free_shipping,
        });
      }
    }

    for (const a of applied) {
      if (a.amount > 0) {
        adjustments.push({ type: "discount", label: a.label, amount: `-${a.amount.toFixed(2)}` });
      }
    }

    return {
      subtotal: subtotal_num.toFixed(2),
      discount_total: Math.min(discount_total, subtotal_num).toFixed(2),
      free_shipping,
      adjustments,
      applied,
      flash_prices,
    };
  },
};
