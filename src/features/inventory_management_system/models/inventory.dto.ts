import { z } from "zod";

export const warehouse_id_dto = z.string().min(1).max(24).default("default");

export const sku_id_dto = z.object({
  sku_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
});

export const product_id_dto = z.object({
  product_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
});

export const adjust_stock_dto = z.object({
  sku_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
  quantity_delta: z.number().int(),
  reference_type: z.string().max(64).optional().nullable(),
  reference_id: z.string().max(255).optional().nullable(),
  note: z.string().max(255).optional(),
});

export const set_stock_dto = z.object({
  sku_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
  quantity_on_hand: z.number().int().min(0),
  reference_type: z.string().max(64).optional().nullable(),
  reference_id: z.string().max(255).optional().nullable(),
});

export const receive_stock_dto = z.object({
  sku_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
  quantity: z.number().int().min(1),
  reference_type: z.string().max(64).optional().nullable(),
  reference_id: z.string().max(255).optional().nullable(),
});

export const list_movements_dto = z.object({
  sku_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
  limit: z.number().int().min(1).max(100).default(30),
});

export const create_reservation_dto = z.object({
  sku_id: z.string().min(1).max(255),
  warehouse_id: warehouse_id_dto,
  quantity: z.number().int().min(1),
  cart_id: z.string().min(1).max(255).optional().nullable(),
  expires_in_sec: z.number().int().min(60).max(86_400).default(900),
});

export const reservation_id_dto = z.object({
  id: z.string().min(1).max(255),
});

export const commit_reservation_dto = z.object({
  id: z.string().min(1).max(255),
  order_id: z.string().min(1).max(255).optional().nullable(),
});
