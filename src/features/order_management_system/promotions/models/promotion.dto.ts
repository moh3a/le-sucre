import { z } from "zod";
import {
  DISCOUNT_SCOPE,
  DISCOUNT_TYPE,
  PROMOTION_STATUS,
  PROMOTION_TYPE,
} from "../constants/promotion-types";

export const cart_line_for_promo_dto = z.object({
  sku_id: z.string().min(1).max(255),
  product_id: z.string().min(1).max(255),
  quantity: z.coerce.number().int().min(1),
  unit_price: z.string(),
  line_total: z.string(),
});

export const validate_promo_code_dto = z.object({
  code: z.string().min(1).max(64),
  lines: z.array(cart_line_for_promo_dto).min(1),
  shipping_cost: z.coerce.number().min(0).default(0),
});

export const promotion_rule_dto = z.object({
  scope_type: z.enum([
    DISCOUNT_SCOPE.cart,
    DISCOUNT_SCOPE.category,
    DISCOUNT_SCOPE.product,
    DISCOUNT_SCOPE.sku,
    DISCOUNT_SCOPE.customer,
    DISCOUNT_SCOPE.shipping,
  ]),
  scope_id: z.string().max(255).optional().nullable(),
  discount_type: z.enum([
    DISCOUNT_TYPE.percent,
    DISCOUNT_TYPE.fixed,
    DISCOUNT_TYPE.free_shipping,
    DISCOUNT_TYPE.buy_x_get_y,
  ]),
  discount_value: z.coerce.number().min(0).default(0),
  min_subtotal: z.coerce.number().min(0).optional().nullable(),
  min_quantity: z.coerce.number().int().min(1).optional().nullable(),
  max_discount_amount: z.coerce.number().min(0).optional().nullable(),
  buy_quantity: z.coerce.number().int().min(1).optional().nullable(),
  get_quantity: z.coerce.number().int().min(1).optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
});

export const create_promotion_dto = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  promotion_type: z.enum([
    PROMOTION_TYPE.promo_code,
    PROMOTION_TYPE.automatic,
    PROMOTION_TYPE.flash_sale,
    PROMOTION_TYPE.bundle,
    PROMOTION_TYPE.customer,
  ]),
  status: z
    .enum([
      PROMOTION_STATUS.draft,
      PROMOTION_STATUS.scheduled,
      PROMOTION_STATUS.active,
      PROMOTION_STATUS.paused,
    ])
    .default(PROMOTION_STATUS.draft),
  priority: z.coerce.number().int().default(100),
  is_stackable: z.boolean().default(false),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  rules: z.array(promotion_rule_dto).default([]),
});

export const update_promotion_dto = create_promotion_dto.partial().extend({
  id: z.string().min(1).max(255),
});

export const list_promotions_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  promotion_type: z.string().optional(),
});

export const create_promo_code_dto = z.object({
  promotion_id: z.string().min(1).max(255),
  code: z.string().min(2).max(64),
  usage_limit: z.coerce.number().int().min(1).optional().nullable(),
  per_customer_limit: z.coerce.number().int().min(1).default(1),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
});

export const flash_sale_item_dto = z.object({
  sku_id: z.string().min(1).max(255),
  product_id: z.string().min(1).max(255),
  flash_price: z.coerce.number().min(0),
  max_quantity: z.coerce.number().int().min(1),
});

export const create_flash_sale_dto = z.object({
  promotion_id: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  max_total_units: z.coerce.number().int().min(1).optional().nullable(),
  items: z.array(flash_sale_item_dto).min(1),
});

export const bundle_item_dto = z.object({
  product_id: z.string().min(1).max(255).optional().nullable(),
  sku_id: z.string().min(1).max(255).optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  is_required: z.boolean().default(true),
});

export const create_bundle_dto = z.object({
  promotion_id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  bundle_type: z.enum(["fixed_price", "percent_off", "buy_x_get_y", "cross_sell"]),
  bundle_price: z.coerce.number().min(0).optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  buy_quantity: z.coerce.number().int().min(1).optional().nullable(),
  get_quantity: z.coerce.number().int().min(1).optional().nullable(),
  items: z.array(bundle_item_dto).min(1),
});
