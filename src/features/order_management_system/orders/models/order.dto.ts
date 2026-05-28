import { z } from "zod";
import { address_snapshot_dto } from "./address.dto";

export const checkout_preview_dto = z.object({
  discount_code: z.string().max(64).optional(),
  shipping_cost: z.coerce.number().min(0).optional(),
  tax_rate: z.coerce.number().min(0).max(1).optional(), // 0.19 = 19%
});

export const place_order_dto = z.object({
  guest_email: z.string().email().optional(),
  shipping_address: address_snapshot_dto,
  billing_address: address_snapshot_dto.optional(),
  discount_code: z.string().max(64).optional(),
  shipping_cost: z.coerce.number().min(0).default(0),
  tax_rate: z.coerce.number().min(0).max(1).optional(),
  idempotency_key: z.string().min(8).max(64),
  payment_provider: z.string().max(32).optional(),
});

export const admin_update_order_status_dto = z.object({
  order_id: z.string().min(1).max(255),
  status: z.string().min(1).max(32),
  note: z.string().max(512).optional(),
});

export const list_orders_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().optional(),
});
