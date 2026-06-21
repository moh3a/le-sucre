import "server-only";

import sharp, { type Sharp, type OutputInfo } from "sharp";
import path from "path";
import { mkdir, writeFile, unlink, access } from "fs/promises";
import { existsSync } from "fs";

import { media_config } from "@/config/media";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";

export interface ImageSizes {
  thumbnail: GeneratedImage;
  medium: GeneratedImage;
  original: GeneratedImage;
}

export interface GeneratedImage {
  width: number;
  height: number;
  size: number;
  storage_key: string;
  url: string;
  format: string;
}

export interface OptimizationOptions {
  strip_metadata?: boolean;
  quality?: number;
  convert_to?: "webp" | "avif" | "jpeg" | null;
  thumbnail_width?: number;
  medium_width?: number;
}

export const IMAGE_BREAKPOINTS = {
  thumbnail: { width: 150, height: 150, fit: "cover" as const },
  medium: { width: 800, height: 800, fit: "inside" as const },
} as const;

const DEFAULT_OPTIONS: Required<OptimizationOptions> = {
  strip_metadata: true,
  quality: 82,
  convert_to: "webp",
  thumbnail_width: IMAGE_BREAKPOINTS.thumbnail.width,
  medium_width: IMAGE_BREAKPOINTS.medium.width,
};

function build_variant_key(original_key: string, variant: string, format: string): string {
  const dir = path.dirname(original_key);
  const ext = path.extname(original_key);
  const base = path.basename(original_key, ext);
  return path.posix.join(dir, `${base}_${variant}.${format}`);
}

function variant_url(storage_key: string): string {
  return `${media_config.MEDIA_PUBLIC_BASE_URL}/${storage_key}`;
}

async function write_variant(
  output_dir: string,
  storage_key: string,
  buffer: Buffer,
): Promise<{ size: number; storage_key: string; url: string }> {
  const disk_path = path.join(process.cwd(), media_config.MEDIA_STORAGE_ROOT, storage_key);
  await mkdir(path.dirname(disk_path), { recursive: true });
  await writeFile(disk_path, buffer);
  return {
    size: buffer.length,
    storage_key,
    url: variant_url(storage_key),
  };
}

function has_alpha(channels: number | undefined): boolean {
  return channels === 4;
}

export async function optimize_image(
  input_buffer: Buffer,
  original_key: string,
  options?: OptimizationOptions,
): Promise<ImageSizes> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const start = Date.now();

  const metadata = await sharp(input_buffer).metadata();

  const is_svg = metadata.format === "svg";
  const original_format = metadata.format ?? "jpeg";
  const output_format = is_svg ? "svg" : opts.convert_to ?? original_format;

  const pipeline = sharp(input_buffer);

  if (opts.strip_metadata && !is_svg) {
    pipeline.withMetadata({});
  }

  if (is_svg) {
    const original: GeneratedImage = {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      size: input_buffer.length,
      storage_key: original_key,
      url: variant_url(original_key),
      format: "svg",
    };
    return { thumbnail: original, medium: original, original };
  }

  const animated = metadata.pages && metadata.pages > 1;
  const has_transparency = has_alpha(metadata.channels);
  const needs_flatten = !animated && has_transparency && output_format !== "webp" && output_format !== "avif";

  const ext_map: Record<string, string> = {
    jpeg: "jpg",
    png: "png",
    webp: "webp",
    avif: "avif",
    tiff: "tiff",
    gif: "gif",
    svg: "svg",
  };

  const variant_format = ext_map[output_format] ?? "jpg";
  const original_ext = ext_map[original_format] ?? "jpg";

  let original_buffer: Buffer;
  let original_info: OutputInfo;

  if (output_format === original_format) {
    original_buffer = input_buffer;
    original_info = { width: metadata.width ?? 0, height: metadata.height ?? 0, size: input_buffer.length, format: original_format, channels: metadata.channels ?? 3, premultiplied: false };
  } else {
    const convert = sharp(input_buffer);
    if (needs_flatten) convert.flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } });
    convert.toFormat(output_format, { quality: opts.quality, effort: 6 });
    original_buffer = await convert.toBuffer();
    original_info = await sharp(original_buffer).metadata() as unknown as OutputInfo;
    await write_variant(
      path.dirname(original_key),
      build_variant_key(original_key, "original", variant_format),
      original_buffer,
    );
  }

  async function generate_variant(
    label: string,
    target_width: number,
    target_height: number,
    fit: "cover" | "inside",
  ): Promise<GeneratedImage> {
    if (animated) {
      const variant_key = build_variant_key(original_key, label, original_ext);
      const variant = await write_variant(
        path.dirname(original_key),
        variant_key,
        input_buffer,
      );
      return {
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        size: variant.size,
        storage_key: variant.storage_key,
        url: variant.url,
        format: original_ext,
      };
    }

    const width = Math.min(target_width, metadata.width ?? target_width);
    const height = fit === "cover" ? target_height : Math.min(target_height, metadata.height ?? target_height);

    if (width >= (metadata.width ?? 0) && height >= (metadata.height ?? 0)) {
      const variant_key = build_variant_key(original_key, label, variant_format);
      const variant = await write_variant(
        path.dirname(original_key),
        variant_key,
        original_buffer,
      );
      return {
        width: original_info.width,
        height: original_info.height,
        size: variant.size,
        storage_key: variant.storage_key,
        url: variant.url,
        format: variant_format,
      };
    }

    const resized = sharp(input_buffer);
    if (needs_flatten) resized.flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } });
    resized
      .resize(width, height, { fit, withoutEnlargement: true })
      .toFormat(output_format, { quality: opts.quality, effort: 6 });

    const resized_buffer = await resized.toBuffer();
    const resized_meta = await sharp(resized_buffer).metadata();

    const variant_key = build_variant_key(original_key, label, variant_format);
    const variant = await write_variant(
      path.dirname(original_key),
      variant_key,
      resized_buffer,
    );

    return {
      width: resized_meta.width ?? width,
      height: resized_meta.height ?? height,
      size: variant.size,
      storage_key: variant.storage_key,
      url: variant.url,
      format: variant_format,
    };
  }

  const original: GeneratedImage = {
    width: original_info.width,
    height: original_info.height,
    size: original_buffer.length,
    storage_key: original_key,
    url: variant_url(original_key),
    format: original_format,
  };

  const sizes: ImageSizes = {
    original,
    thumbnail: await generate_variant(
      "thumb",
      opts.thumbnail_width,
      IMAGE_BREAKPOINTS.thumbnail.height,
      IMAGE_BREAKPOINTS.thumbnail.fit,
    ),
    medium: await generate_variant(
      "medium",
      opts.medium_width,
      IMAGE_BREAKPOINTS.medium.height,
      IMAGE_BREAKPOINTS.medium.fit,
    ),
  };

  const elapsed = Date.now() - start;
  logger.info("image_optimized", {
    key: original_key,
    format: original_format,
    output_format: variant_format,
    original_size: input_buffer.length,
    thumbnail_size: sizes.thumbnail.size,
    medium_size: sizes.medium.size,
    elapsed_ms: elapsed,
  });

  return sizes;
}

export async function generate_blur_placeholder(
  storage_key: string,
): Promise<string | null> {
  try {
    const disk_path = path.join(
      process.cwd(),
      media_config.MEDIA_STORAGE_ROOT,
      storage_key,
    );

    if (!existsSync(disk_path)) return null;

    const cache_key = `media:blur:${storage_key}`;
    const cached = await redis.get(cache_key);
    if (cached) return cached;

    const buffer = await sharp(disk_path)
      .resize(32, 32, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 30, chromaSubsampling: "4:2:0" })
      .toBuffer();

    const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    await redis.setex(cache_key, 86400 * 7, base64);

    return base64;
  } catch (error) {
    logger.warn("blur_placeholder_failed", {
      storage_key,
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function strip_exif(input_buffer: Buffer): Promise<Buffer> {
  return sharp(input_buffer).withMetadata({}).toBuffer();
}

export async function validate_image_dimensions(
  buffer: Buffer,
): Promise<{ width: number; height: number; format: string; size: number }> {
  const meta = await sharp(buffer).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? "unknown",
    size: buffer.length,
  };
}

export const MAX_IMAGE_DIMENSIONS = {
  width: 10000,
  height: 10000,
  megapixels: 50,
} as const;

export function is_dimension_within_limits(
  width: number,
  height: number,
): boolean {
  if (width > MAX_IMAGE_DIMENSIONS.width || height > MAX_IMAGE_DIMENSIONS.height) {
    return false;
  }
  const megapixels = (width * height) / 1_000_000;
  return megapixels <= MAX_IMAGE_DIMENSIONS.megapixels;
}

export async function delete_variants(storage_key: string): Promise<void> {
  const dir = path.dirname(storage_key);
  const ext = path.extname(storage_key);
  const base = path.basename(storage_key, ext);
  const storage_root = path.join(process.cwd(), media_config.MEDIA_STORAGE_ROOT);
  const variants = ["thumb", "medium", "original"];

  const formats_to_try = ["jpg", "webp", "avif", "png", "svg", "gif"];

  for (const variant of ["thumb", "medium", "original"]) {
    for (const fmt of formats_to_try) {
      const variant_key = path.posix.join(dir, `${base}_${variant}.${fmt}`);
      const disk_path = path.join(storage_root, variant_key);
      try {
        await access(disk_path);
        await unlink(disk_path);
      } catch {}
    }
  }
}
