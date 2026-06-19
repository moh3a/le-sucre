import { z } from "zod";
import { urlSchema } from "@/lib/validations";

export const wishlist_priority_schema = z.enum(["low", "medium", "high", "urgent"]);

export const create_wishlist_dto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  is_public: z.boolean().default(false),
  is_private: z.boolean().default(true),
  cover_image_url: urlSchema.max(2048).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const update_wishlist_dto = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  is_public: z.boolean().optional(),
  is_private: z.boolean().optional(),
  cover_image_url: urlSchema.max(2048).optional().nullable(),
  sort_order: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const set_default_wishlist_dto = z.object({
  id: z.string().min(1),
});

export const list_wishlists_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const get_wishlist_by_id_dto = z.object({
  id: z.string().min(1),
});

export const delete_wishlist_dto = z.object({
  id: z.string().min(1),
});
