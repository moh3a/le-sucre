import { z } from "zod";

export const create_category_dto = z.object({
  name: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .nullable(),
  description: z.string().max(5000).optional().nullable(),
  parent_id: z.string().length(24).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const update_category_dto = create_category_dto.partial().extend({
  id: z.string().length(24),
});

export const move_category_dto = z.object({
  id: z.string().length(24),
  new_parent_id: z.string().length(24).nullable(),
});

export const list_categories_dto = z.object({
  parent_id: z.string().length(24).nullable().optional(),
  is_active: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const filter_by_category_dto = z.object({
  category_id: z.string().length(24),
  include_descendants: z.boolean().default(true),
});
