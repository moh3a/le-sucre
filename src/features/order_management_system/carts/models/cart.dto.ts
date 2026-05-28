import { z } from "zod";

export const add_cart_item_dto = z.object({
  sku_id: z.string().min(1).max(255),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const update_cart_item_dto = z.object({
  quantity: z.number().int().min(1).max(99),
});
