import { z } from "zod";

export const warehouse_id_dto = z.string().min(1).max(255);

export const create_warehouse_dto = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9_-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres, tirets et underscores"),
  location: z.string().max(1000).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
});

export const update_warehouse_dto = z.object({
  id: warehouse_id_dto,
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9_-]+$/)
    .optional(),
  location: z.string().max(1000).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const list_warehouses_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  include_inactive: z.boolean().default(false),
  search: z.string().max(255).optional(),
});
