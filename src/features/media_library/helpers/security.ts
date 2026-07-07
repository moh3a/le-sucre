import "server-only";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { media_config } from "@/config/media";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";

const FILE_SIGNATURES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xff, 0xd8, 0xff])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  "image/gif": [
    new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]),
    new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
  ],
  "image/avif": [
    new Uint8Array([0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]),
    new Uint8Array([0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x69, 0x66, 0x31]),
  ],
  "image/svg+xml": [],
  "video/mp4": [
    new Uint8Array([0x00, 0x00, 0x00]),
    new Uint8Array([0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
    new Uint8Array([0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]),
  ],
  "video/webm": [new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])],
  "video/ogg": [new Uint8Array([0x4f, 0x67, 0x67, 0x53])],
  "application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  "application/msword": [new Uint8Array([0xd0, 0xcf, 0x11, 0xe0])],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
  ],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detected_mime?: string;
  is_image: boolean;
  is_svg: boolean;
  is_animated: boolean;
}

export function get_mime_from_magic(buffer: Uint8Array): string | null {
  if (buffer.length < 4) return null;

  const header = Array.from(buffer.slice(0, 12))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");

  const hex = header;
  if (hex.startsWith("ff d8 ff")) return "image/jpeg";
  if (hex.startsWith("89 50 4e 47")) return "image/png";
  if (hex.startsWith("47 49 46 38")) return "image/gif";

  if (
    hex.startsWith("52 49 46 46") &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  if (
    hex.startsWith("00 00 00") &&
    buffer.length >= 12 &&
    ((buffer[4] === 0x1c &&
      buffer.slice(5, 8).toString() === "ftyp" &&
      (buffer.slice(8, 12).toString() === "avif" || buffer.slice(8, 12).toString() === "avis")) ||
      (buffer[4] === 0x20 &&
        buffer.slice(5, 8).toString() === "ftyp" &&
        buffer.slice(8, 12).toString() === "avif"))
  ) {
    return "image/avif";
  }

  if (hex.startsWith("25 50 44 46")) return "application/pdf";
  if (hex.startsWith("d0 cf 11 e0")) return "application/msword";
  if (hex.startsWith("50 4b 03 04")) return "application/zip";
  if (hex.startsWith("1a 45 df a3")) return "video/webm";
  if (hex.startsWith("4f 67 67 53")) return "video/ogg";

  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x00) {
    if (buffer.length >= 12) {
      const box_type = buffer.slice(4, 8).toString();
      if (box_type === "ftyp" || box_type === "moov" || box_type === "mdat") {
        return "video/mp4";
      }
    }
  }

  const text_start = new TextDecoder().decode(buffer.slice(0, 512));
  if (text_start.trimStart().startsWith("<svg") || text_start.trimStart().startsWith("<?xml")) {
    const lower = text_start.toLowerCase();
    if (lower.includes("<svg") || (lower.includes("<?xml") && lower.includes("<svg"))) {
      return "image/svg+xml";
    }
  }

  return null;
}

export function verify_file_magic(buffer: Uint8Array, mime_type: string): boolean {
  if (mime_type === "image/svg+xml") return true;

  const signatures = FILE_SIGNATURES[mime_type];
  if (!signatures || signatures.length === 0) return true;

  return signatures.some((sig) => {
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  });
}

const EXECUTABLE_EXTENSIONS = new Set([
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
  ".bin",
  ".msi",
  ".jar",
  ".py",
  ".pl",
  ".rb",
  ".wasm",
  ".app",
  ".com",
  ".scr",
  ".sys",
  ".vbs",
  ".vbe",
  ".js",
  ".jse",
  ".wsf",
  ".wsh",
  ".ps1",
  ".psm1",
  ".psd1",
  ".reg",
  ".inf",
  ".drv",
  ".ocx",
  ".cpl",
  ".efi",
]);

const DOUBLE_EXTENSION_PATTERNS = [
  /.+\.(jpg|jpeg|png|gif|pdf|txt|doc|docx)\.[a-z0-9]{2,6}$/i,
  /.+\.(php|php5|phtml|cgi|asp|aspx|jsp|pl|py|rb)\.[a-z0-9]{2,5}$/i,
  /.+\.(svg|xml|html?)\.[a-z0-9]{2,6}$/i,
];

export function detect_double_extension(filename: string): boolean {
  return DOUBLE_EXTENSION_PATTERNS.some((pattern) => pattern.test(filename));
}

export function sanitize_filename(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+/, "")
    .substring(0, 255)
    .toLowerCase();
}

export const UPLOAD_QUOTA = {
  max_files_per_user: 1000,
  max_total_bytes_per_user: 1024 * 1024 * 500,
  daily_upload_limit_per_user: 1024 * 1024 * 100,
} as const;

export async function check_user_upload_quota(
  user_id: string,
  file_size: number,
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const quota_key = `media:quota:user:${user_id}`;
    const daily_key = `media:daily:user:${user_id}:${new Date().toISOString().slice(0, 10)}`;

    const file_count = Number(await redis.get(`${quota_key}:count`)) ?? 0;
    const total_bytes = Number(await redis.get(`${quota_key}:bytes`)) ?? 0;
    const daily_bytes = Number(await redis.get(daily_key)) ?? 0;

    if (file_count >= UPLOAD_QUOTA.max_files_per_user) {
      return { allowed: false, reason: "Upload limit reached: too many files" };
    }
    if (total_bytes + file_size > UPLOAD_QUOTA.max_total_bytes_per_user) {
      return { allowed: false, reason: "Upload limit reached: storage quota exceeded" };
    }
    if (daily_bytes + file_size > UPLOAD_QUOTA.daily_upload_limit_per_user) {
      return { allowed: false, reason: "Upload limit reached: daily quota exceeded" };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export async function track_upload_quota(user_id: string, file_size: number): Promise<void> {
  try {
    const quota_key = `media:quota:user:${user_id}`;
    const daily_key = `media:daily:user:${user_id}:${new Date().toISOString().slice(0, 10)}`;

    const pipeline = redis.pipeline();
    pipeline.incr(`${quota_key}:count`);
    pipeline.incrby(`${quota_key}:bytes`, file_size);
    pipeline.expire(`${quota_key}:count`, 86400 * 30);
    pipeline.expire(`${quota_key}:bytes`, 86400 * 30);
    pipeline.incrby(daily_key, file_size);
    pipeline.expire(daily_key, 86400 * 2);
    await pipeline.exec();
  } catch {}
}

export async function enforce_upload_rate_limit(identifier: string): Promise<boolean> {
  const result = await rateLimit(`media_upload:${identifier}`, {
    action: "media_upload",
    limit: 50,
    windowSec: 3600,
  });
  return result.success;
}

export const SUSPICIOUS_CONTENT_PATTERNS = [
  /<\s*(?:script|iframe|embed|object|applet|meta|link)[\s\S]*?>/i,
  /(?:base64_decode|eval|exec|system|passthru|shell_exec|popen|proc_open|pcntl_exec)/i,
  /(?:GIF89a|GIF87a)[\s\S]*?(?:<?php|<?PHp|<?=)/i,
  /\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00{20,}/,
  /(?:cmd|powershell|wscript|cscript)\.exe/i,
  /_\$_{[\s\S]*?\(/,
];

export function has_suspicious_content(buffer: Uint8Array): boolean {
  const text = new TextDecoder().decode(buffer.slice(0, Math.min(buffer.length, 4096)));
  return SUSPICIOUS_CONTENT_PATTERNS.some((pattern) => pattern.test(text));
}

export function build_media_storage_key(original_name: string): string {
  const safe_name = original_name
    .replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, "_")
    .replace(/\.{2,}/g, ".")
    .toLowerCase();

  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `library/${ts}-${rand}-${safe_name}`;
}

export async function quarantine_file(
  buffer: Buffer,
  reason: string,
  original_name: string,
  user_id: string | null,
): Promise<void> {
  const quarantine_dir = path.join(
    process.cwd(),
    media_config.MEDIA_STORAGE_ROOT,
    "__quarantine__",
  );
  const filename = `${Date.now()}-${sanitize_filename(original_name)}`;
  const filepath = path.join(quarantine_dir, filename);

  await mkdir(quarantine_dir, { recursive: true });
  await writeFile(filepath, buffer);

  logger.warn("file_quarantined", {
    original_name,
    reason,
    user_id,
    quarantine_path: filepath,
    size: buffer.length,
  });
}

export async function quarantine_upload(
  buffer: Buffer,
  user_id: string | null,
  original_name: string,
  reason: string,
): Promise<void> {
  await quarantine_file(buffer, reason, original_name, user_id);

  const failed_key = `media:quarantine:user:${user_id ?? "anonymous"}`;
  const pipeline = redis.pipeline();
  pipeline.incr(failed_key);
  pipeline.expire(failed_key, 86400);
  pipeline.lpush(
    `media:quarantine:log`,
    JSON.stringify({
      time: new Date().toISOString(),
      user_id,
      original_name,
      reason,
    }),
  );
  pipeline.ltrim(`media:quarantine:log`, 0, 999);
  await pipeline.exec();
}
