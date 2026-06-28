import { z } from "zod";

// ─── Profile ────────────────────────────────────────────────
export const update_profile_schema = z.object({
  first_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255).optional(),
  phone_secondary: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Numéro de téléphone invalide")
    .optional()
    .nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu: YYYY-MM-DD").optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  company: z.string().max(255).optional().nullable(),
  tax_id: z.string().max(100).optional().nullable(),
  vat_number: z.string().max(100).optional().nullable(),
  newsletter_opt_in: z.boolean().optional(),
  marketing_opt_in: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  preferred_language: z.enum(["fr", "en", "ar"]).optional(),
  preferred_currency: z.string().max(3).optional(),
  bio: z.string().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const initialize_profile_schema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
});

// ─── Address ─────────────────────────────────────────────────
export const create_address_schema = z.object({
  label: z.string().max(100).optional(),
  type: z.enum(["shipping", "billing", "both"]).default("both"),
  first_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255).optional(),
  company: z.string().max(255).optional().nullable(),
  address_line_1: z.string().min(1).max(500),
  address_line_2: z.string().max(500).optional().nullable(),
  city: z.string().min(1).max(255),
  state: z.string().max(255).optional().nullable(),
  postal_code: z.string().max(50).optional().nullable(),
  country: z.string().min(1).max(100).default("Algeria"),
  phone: z.string().max(50).optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
  is_default: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const update_address_schema = create_address_schema.partial().extend({
  id: z.string().min(1),
});

export const set_default_address_schema = z.object({
  address_id: z.string().min(1),
  type: z.enum(["shipping", "billing"]),
});

export type UpdateProfileInput = z.infer<typeof update_profile_schema>;
export type InitializeProfileInput = z.infer<typeof initialize_profile_schema>;
export type CreateAddressInput = z.infer<typeof create_address_schema>;
export type UpdateAddressInput = z.infer<typeof update_address_schema>;
export type SetDefaultAddressInput = z.infer<typeof set_default_address_schema>;
