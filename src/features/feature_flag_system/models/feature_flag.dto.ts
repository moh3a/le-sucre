import { z } from "zod";

const localized_string = z.object({
  en: z.string().min(1).max(255),
  fr: z.string().min(1).max(255),
  ar: z.string().min(1).max(255),
});

export const create_feature_flag_dto = z.object({
  key: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9][a-z0-9_-]*$/, "Key must start with a lowercase letter or number"),
  name: localized_string,
  description: localized_string.optional().default({ en: "", fr: "", ar: "" }),
  enabled: z.boolean().default(false),
});

export const update_feature_flag_dto = z.object({
  id: z.string().min(1).max(255),
  name: localized_string.optional(),
  description: localized_string.optional(),
  enabled: z.boolean().optional(),
});

export const toggle_feature_flag_dto = z.object({
  id: z.string().min(1).max(255),
  enabled: z.boolean(),
});

export const list_feature_flags_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
});
