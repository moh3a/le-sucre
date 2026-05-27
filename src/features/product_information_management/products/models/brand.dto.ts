import { z } from "zod";

export const create_brand_dto = z.object({
  name: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(5000).optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const update_brand_dto = create_brand_dto.partial().extend({
  id: z.string().min(1).max(255),
});

export const list_brands_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  search: z.string().max(255).optional(),
  is_active: z.boolean().optional(),
});
