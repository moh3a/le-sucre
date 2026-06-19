import { z } from "zod";

export const save_for_later_dto = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  original_cart_item_id: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const move_to_cart_dto = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1).optional(),
});

export const remove_saved_item_dto = z.object({
  id: z.string().min(1),
});

export const list_saved_items_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});
