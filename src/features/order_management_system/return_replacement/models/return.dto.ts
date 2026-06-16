import { z } from "zod";

export const return_item_dto = z.object({
  sku_id: z.string().min(1).max(255),
  product_name: z.string().min(1).max(255),
  sku_code: z.string().min(1).max(128),
  quantity: z.coerce.number().int().min(1).max(9999),
  unit_price: z.string().min(1),
  condition: z.string().max(64).optional(),
});

export const create_return_request_dto = z.object({
  order_id: z.string().min(1).max(255),
  type: z.enum(["return", "replacement", "failed_delivery"]),
  reason: z.string().min(1).max(2048),
  customer_note: z.string().max(2048).optional(),
  items: z.array(return_item_dto).min(1),
});

export const customer_create_return_request_dto = z.object({
  order_id: z.string().min(1).max(255),
  type: z.enum(["return", "replacement"]),
  reason: z.string().min(1).max(2048),
  customer_note: z.string().max(2048).optional(),
  items: z.array(return_item_dto).min(1),
});

export const review_return_request_dto = z.object({
  id: z.string().min(1).max(255),
  status: z.enum(["approved", "rejected"]),
  admin_note: z.string().max(2048).optional(),
  refund_amount: z.coerce.number().min(0).optional(),
});

export const receive_return_dto = z.object({
  id: z.string().min(1).max(255),
  admin_note: z.string().max(2048).optional(),
});

export const complete_return_dto = z.object({
  id: z.string().min(1).max(255),
  admin_note: z.string().max(2048).optional(),
  refund_amount: z.coerce.number().min(0).optional(),
});

export const cancel_return_request_dto = z.object({
  id: z.string().min(1).max(255),
  reason: z.string().max(512).optional(),
});

export const list_return_requests_dto = z.object({
  order_id: z.string().min(1).max(255),
});

export const admin_list_return_requests_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
});
