import { z } from "zod";
import { urlSchema } from "@/lib/validations";

export const create_collection_dto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  cover_image_url: urlSchema.max(2048).optional().nullable(),
  is_public: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const update_collection_dto = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  cover_image_url: urlSchema.max(2048).optional().nullable(),
  is_public: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const list_collections_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  is_public: z.boolean().optional(),
});

export const add_collection_item_dto = z.object({
  collection_id: z.string().min(1),
  product_id: z.string().min(1),
  variant_id: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const remove_collection_item_dto = z.object({
  collection_id: z.string().min(1),
  item_id: z.string().min(1),
});

export const list_collection_items_dto = z.object({
  collection_id: z.string().min(1),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});
