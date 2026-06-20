import { z } from "zod";
import { MEDIA_KINDS, MEDIA_PROVIDERS, ENTITY_TYPES } from "../constants";

const media_kinds_schema = z.enum(MEDIA_KINDS as unknown as [string, ...string[]]);
const media_providers_schema = z.enum(MEDIA_PROVIDERS as unknown as [string, ...string[]]);
const entity_types_schema = z.enum(ENTITY_TYPES as unknown as [string, ...string[]]);

export const media_dto = z.object({
  id: z.string(),
  filename: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  kind: media_kinds_schema,
  size: z.number(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  url: z.string(),
  storage_key: z.string(),
  provider: media_providers_schema,
  alt: z.string().nullable(),
  caption: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  is_public: z.boolean(),
  uploaded_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const create_media_dto = z.object({
  filename: z.string().min(1),
  original_name: z.string().min(1),
  mime_type: z.string().min(1),
  kind: media_kinds_schema,
  size: z.number().int().positive(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  url: z.string().url(),
  storage_key: z.string().min(1),
  provider: media_providers_schema.default("local" as const),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  is_public: z.boolean().default(true),
  uploaded_by: z.string().nullable().optional(),
});

export const update_media_dto = z.object({
  id: z.string(),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  is_public: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const list_media_dto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  kind: media_kinds_schema.optional(),
  mime_type: z.string().optional(),
  provider: media_providers_schema.optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  is_public: z.coerce.boolean().optional(),
  sort_by: z
    .enum(["created_at" as const, "size" as const, "filename" as const])
    .default("created_at" as const),
  sort_order: z.enum(["asc" as const, "desc" as const]).default("desc" as const),
});

export const media_usage_dto = z.object({
  id: z.string(),
  media_id: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  field: z.string().nullable(),
  sort_order: z.number(),
  is_primary: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string(),
});

export const create_media_usage_dto = z.object({
  media_id: z.string(),
  entity_type: entity_types_schema,
  entity_id: z.string(),
  field: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_primary: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});
