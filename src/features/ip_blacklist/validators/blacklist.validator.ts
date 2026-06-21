import { z } from "zod";

export const add_to_blacklist_schema = z.object({
  ip_address: z.string().min(1).max(45),
  reason: z.string().max(1000).optional().nullable(),
  reason_fr: z.string().max(1000).optional().nullable(),
  reason_ar: z.string().max(1000).optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const update_blacklist_schema = z.object({
  reason: z.string().max(1000).optional().nullable(),
  reason_fr: z.string().max(1000).optional().nullable(),
  reason_ar: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const list_blacklist_schema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type AddToBlacklistInput = z.infer<typeof add_to_blacklist_schema>;
export type UpdateBlacklistInput = z.infer<typeof update_blacklist_schema>;
export type ListBlacklistInput = z.infer<typeof list_blacklist_schema>;
