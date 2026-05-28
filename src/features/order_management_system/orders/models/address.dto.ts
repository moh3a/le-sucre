import { z } from "zod";

export const address_snapshot_dto = z.object({
  full_name: z.string().min(2).max(255),
  phone: z.string().min(6).max(32),
  line1: z.string().min(3).max(255),
  line2: z.string().max(255).optional().nullable(),
  city: z.string().min(2).max(128),
  state: z.string().max(128).optional().nullable(),
  postal_code: z.string().max(32).optional().nullable(),
  country_code: z.string().length(2).default("DZ"),
});

export const save_address_dto = address_snapshot_dto.extend({
  label: z.string().max(64).default("home"),
  is_default_shipping: z.boolean().default(false),
});
