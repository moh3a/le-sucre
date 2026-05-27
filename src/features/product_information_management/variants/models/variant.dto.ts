import { z } from "zod";

export const variant_channel_enum = z.enum(["retail", "wholesale"]);
export type VariantChannel = z.infer<typeof variant_channel_enum>;

export const create_property_dto = z.object({
  product_id: z.string().min(1).max(255),
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  name: z.string().min(2).max(255),
  sort_order: z.number().int().min(0).default(0),
  is_required: z.boolean().default(true),
});

export const update_property_dto = create_property_dto.partial().extend({
  id: z.string().min(1).max(255),
});

export const create_property_value_dto = z.object({
  property_id: z.string().min(1).max(255),
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  label: z.string().min(1).max(255),
  sort_order: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const update_property_value_dto = create_property_value_dto.partial().extend({
  id: z.string().min(1).max(255),
});

export const generate_skus_dto = z.object({
  product_id: z.string().min(1).max(255),
  max_combinations: z.number().int().min(1).max(5000).default(500),
});

export const create_sku_dto = z.object({
  product_id: z.string().min(1).max(255),
  sku_code: z.string().min(1).max(128),
  barcode: z.string().max(64).optional().nullable(),
  base_price: z.coerce.number().min(0).optional().nullable(),
  offer_price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional().nullable(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // property_value_ids determines the combination
  property_value_ids: z.array(z.string().min(1).max(255)).min(1),
});

export const update_sku_dto = create_sku_dto.partial().extend({
  id: z.string().min(1).max(255),
});

export const set_sku_price_tier_dto = z.object({
  sku_id: z.string().min(1).max(255),
  channel: variant_channel_enum.default("retail"),
  min_quantity: z.number().int().min(1),
  price: z.coerce.number().min(0),
  currency: z.string().length(3).default("DZD"),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
});

export const delete_sku_price_tier_dto = z.object({
  sku_id: z.string().min(1).max(255),
  channel: variant_channel_enum,
  min_quantity: z.number().int().min(1),
});

export const upsert_wholesale_rule_dto = z
  .object({
    product_id: z.string().min(1).max(255).optional().nullable(),
    sku_id: z.string().min(1).max(255).optional().nullable(),
    min_quantity: z.number().int().min(1),
    currency: z.string().length(3).default("DZD"),
    price: z.coerce.number().min(0).optional().nullable(),
    discount_percent: z.coerce.number().min(0).max(100).optional().nullable(),
    is_active: z.boolean().default(true),
  })
  .refine((v) => Boolean(v.product_id) !== Boolean(v.sku_id), {
    message: "Provide exactly one of product_id or sku_id",
  })
  .refine((v) => v.price != null || v.discount_percent != null, {
    message: "Provide price or discount_percent",
  });

export const delete_wholesale_rule_dto = z.object({
  id: z.string().min(1).max(255),
});

export const resolve_price_dto = z.object({
  product_id: z.string().min(1).max(255),
  sku_id: z.string().min(1).max(255),
  quantity: z.number().int().min(1).default(1),
  channel: variant_channel_enum.default("retail"),
  currency: z.string().length(3).optional(),
});
