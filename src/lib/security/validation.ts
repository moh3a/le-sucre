import "server-only";
import { z } from "zod";

export const content_type_schema = z.object({
  "content-type": z.string().optional(),
});

export function assert_content_type(req: Request, allowed: string[]): void {
  const ct = req.headers.get("content-type")?.toLowerCase() ?? "";
  const ok = allowed.some((a) => ct.startsWith(a));
  if (!ok) throw new Error(`Content-Type ${ct} not allowed`);
}

export const request_size_limits = {
  default: 1024 * 100,
  search: 1024 * 10,
  checkout: 1024 * 50,
  media_upload: 1024 * 1024 * 50,
  review: 1024 * 10,
  product_import: 1024 * 1024 * 10,
  export: 1024 * 100,
} as const;

export function assert_payload_size(req: Request, max_bytes: number): void {
  const cl = req.headers.get("content-length");
  if (cl && parseInt(cl, 10) > max_bytes) {
    throw new Error(`Payload exceeds ${max_bytes} byte limit`);
  }
}

export const pagination_limits = {
  max_per_page: 100,
  default_per_page: 20,
  max_offset: 10000,
};

export const search_limits = {
  max_query_length: 200,
  max_filters: 20,
  max_sort_fields: 3,
  min_query_length: 2,
};

export function validate_search_query(q: string): string {
  const cleaned = q.replace(/[<>"';&|\\*?%~#(){}[\]!^$=+`]/g, "").trim();
  if (cleaned.length > 0 && cleaned.length < search_limits.min_query_length) {
    throw new Error(`Search query too short (min ${search_limits.min_query_length})`);
  }
  if (cleaned.length > search_limits.max_query_length) {
    throw new Error(`Search query too long (max ${search_limits.max_query_length})`);
  }
  return cleaned;
}

export const upload_limits = {
  max_file_size: 50 * 1024 * 1024,
  allowed_mime_types: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "video/mp4",
    "video/webm",
    "application/pdf",
    "text/plain",
  ],
  allowed_extensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
    ".mp4",
    ".webm",
    ".pdf",
    ".txt",
  ],
  max_files_per_upload: 10,
  max_total_upload_size: 200 * 1024 * 1024,
} as const;

export function validate_file_upload(filename: string, mime_type: string, size: number): void {
  const ext = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (!ext || !(upload_limits.allowed_extensions as readonly string[]).includes(ext)) {
    throw new Error(`File extension ${ext} not allowed`);
  }
  if (!(upload_limits.allowed_mime_types as readonly string[]).includes(mime_type)) {
    throw new Error(`MIME type ${mime_type} not allowed`);
  }
  if (size > upload_limits.max_file_size) {
    throw new Error(`File size ${size} exceeds limit ${upload_limits.max_file_size}`);
  }
}
