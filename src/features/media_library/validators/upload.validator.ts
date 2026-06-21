import { z } from "zod";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  ENTITY_TYPES,
} from "../constants";

const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

const entity_types_enum = z.enum(ENTITY_TYPES as unknown as [string, ...string[]]);

export const media_upload_input = z.object({
  file: z.instanceof(File, { message: "A file is required" }),
  alt: z.string().max(512).nullable().optional(),
  caption: z.string().max(5000).nullable().optional(),
  width: z.coerce.number().int().positive().max(10000).nullable().optional(),
  height: z.coerce.number().int().positive().max(10000).nullable().optional(),
  is_public: z.coerce.boolean().default(true),
  entity_type: entity_types_enum.nullable().optional(),
  entity_id: z.string().nullable().optional(),
  field: z.string().max(64).nullable().optional(),
  is_primary: z.coerce.boolean().default(false),
});

function is_allowed_mime(value: unknown): value is string {
  return typeof value === "string" && (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export const media_upload_file_check = z.object({
  mime_type: z.string().refine(is_allowed_mime, "File type not allowed"),
  size: z.number().max(MAX_VIDEO_SIZE, "File too large"),
});

export function get_max_size_for_mime(mime_type: string): number {
  if (mime_type.startsWith("image/")) return MAX_IMAGE_SIZE;
  if (mime_type.startsWith("video/")) return MAX_VIDEO_SIZE;
  return MAX_DOCUMENT_SIZE;
}

export function is_mime_allowed(mime_type: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime_type);
}
