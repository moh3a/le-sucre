import { z } from "zod";
import { wishlist_priority_schema } from "./wishlist.dto";

export const add_wishlist_item_dto = z.object({
  wishlist_id: z.string().min(1),
  product_id: z.string().min(1),
  variant_id: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  priority: wishlist_priority_schema.default("medium"),
  notes: z.string().max(2000).optional().nullable(),
});

export const update_wishlist_item_dto = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1).optional(),
  priority: wishlist_priority_schema.optional(),
  notes: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().optional(),
});

export const remove_wishlist_item_dto = z.object({
  id: z.string().min(1),
});

export const move_wishlist_item_dto = z.object({
  item_id: z.string().min(1),
  from_wishlist_id: z.string().min(1),
  to_wishlist_id: z.string().min(1),
});

export const bulk_add_wishlist_items_dto = z.object({
  wishlist_id: z.string().min(1),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      variant_id: z.string().optional().nullable(),
      quantity: z.number().int().min(1).default(1),
      priority: wishlist_priority_schema.default("medium"),
      notes: z.string().max(2000).optional().nullable(),
    }),
  ).min(1).max(100),
});

export const reorder_wishlist_items_dto = z.object({
  wishlist_id: z.string().min(1),
  item_ids: z.array(z.string().min(1)),
});

export const list_wishlist_items_dto = z.object({
  wishlist_id: z.string().min(1),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  priority: wishlist_priority_schema.optional(),
  is_purchased: z.boolean().optional(),
});
