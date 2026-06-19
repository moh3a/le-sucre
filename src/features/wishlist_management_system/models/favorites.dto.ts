import { z } from "zod";

export const add_favorite_dto = z.object({
  product_id: z.string().optional(),
  brand_id: z.string().optional(),
  category_id: z.string().optional(),
}).refine(
  (data) => data.product_id || data.brand_id || data.category_id,
  { message: "At least one of product_id, brand_id, or category_id is required" },
);

export const remove_favorite_dto = z.object({
  id: z.string().min(1),
});

export const list_favorites_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  type: z.enum(["product", "brand", "category"]).optional(),
});

export const check_favorite_dto = z.object({
  product_id: z.string().optional(),
  brand_id: z.string().optional(),
  category_id: z.string().optional(),
});
