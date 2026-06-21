import "server-only";

import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

import { generate_id } from "@/lib/utils";
import { media_config, build_public_media_url } from "@/config/media";
import { logger } from "@/lib/logger";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import {
  MEDIA_ERROR,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  UPLOAD_LIMITS,
} from "../constants";
import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";
import { MediaRepository } from "../repositories/media.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import {
  optimize_image,
  generate_blur_placeholder,
  delete_variants,
  sanitize_svg_content,
  verify_file_magic,
  detect_double_extension,
  sanitize_filename,
  check_user_upload_quota,
  track_upload_quota,
  enforce_upload_rate_limit,
  has_suspicious_content,
  build_media_storage_key,
  quarantine_upload,
  is_dimension_within_limits,
} from "../helpers";
import type { ImageSizes, UploadResult } from "../types";
import { get_max_size_for_mime, is_mime_allowed } from "../validators/upload.validator";

function detect_kind(mime_type: string): "image" | "video" | "document" | "audio" {
  if (mime_type.startsWith("image/")) return "image";
  if (mime_type.startsWith("video/")) return "video";
  if (mime_type.startsWith("audio/")) return "audio";
  return "document";
}

export class MediaService {
  constructor(private readonly repo = new MediaRepository()) {}

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    kind?: string;
    mime_type?: string;
    provider?: string;
    entity_type?: string;
    entity_id?: string;
    is_public?: boolean;
    sort_by?: string;
    sort_order?: string;
  }) {
    return this.repo.list(params);
  }

  async get_by_id(id: string) {
    const item = await this.repo.find_by_id(id);
    if (!item) throw_error(MEDIA_ERROR.NOT_FOUND);
    return item;
  }

  async get_usages(media_id: string) {
    const item = await this.repo.find_by_id(media_id);
    if (!item) throw_error(MEDIA_ERROR.NOT_FOUND);
    const usages = await this.repo.get_usages(media_id);
    const usage_count = await this.repo.count_usages(media_id);
    return { item, usages, usage_count };
  }

  async get_entity_media(entity_type: string, entity_id: string) {
    const usages = await this.repo.get_entity_usages(entity_type, entity_id);
    const media_ids = usages.map((u) => u.media_id);
    if (media_ids.length === 0) return { media: [], usages: [] };

    const items = await Promise.all(media_ids.map((id) => this.repo.find_by_id(id)));
    return {
      media: items.filter(Boolean),
      usages,
    };
  }

  async upload_file(
    file: File,
    options?: {
      alt?: string | null;
      caption?: string | null;
      width?: number | null;
      height?: number | null;
      is_public?: boolean;
      uploaded_by?: string | null;
      skip_optimization?: boolean;
    },
  ): Promise<UploadResult> {
    if (!file || file.size === 0) throw_error(MEDIA_ERROR.UPLOAD_FAILED);

    const mime_type = file.type || "application/octet-stream";
    const original_name = file.name;

    if (original_name.length > UPLOAD_LIMITS.MAX_FILENAME_LENGTH) {
      throw_error(MEDIA_ERROR.INVALID_FILE_TYPE);
    }

    if (detect_double_extension(original_name)) {
      logger.warn("double_extension_detected", { filename: original_name });
      throw_error(MEDIA_ERROR.SUSPICIOUS_FILE);
    }

    if (!is_mime_allowed(mime_type)) {
      throw_error(MEDIA_ERROR.INVALID_FILE_TYPE);
    }

    const max_size = get_max_size_for_mime(mime_type);
    if (file.size > max_size) throw_error(MEDIA_ERROR.FILE_TOO_LARGE);

    const buffer = Buffer.from(await file.arrayBuffer());

    const magic_ok = verify_file_magic(new Uint8Array(buffer), mime_type);
    if (!magic_ok) {
      logger.warn("mime_magic_mismatch", { filename: original_name, mime_type, size: buffer.length });
      throw_error(MEDIA_ERROR.MIME_MISMATCH);
    }

    if (has_suspicious_content(new Uint8Array(buffer))) {
      logger.warn("suspicious_file_content", { filename: original_name, mime_type });
      throw_error(MEDIA_ERROR.SUSPICIOUS_FILE);
    }

    let final_buffer = buffer;

    if (mime_type === "image/svg+xml") {
      const svg_text = new TextDecoder().decode(buffer);
      const { sanitized, is_modified, warnings } = sanitize_svg_content(svg_text);
      if (warnings.length > 0) {
        logger.warn("svg_sanitization", { filename: original_name, warnings });
      }
      final_buffer = Buffer.from(sanitized, "utf-8");
    }

    const storage_key = build_media_storage_key(original_name);
    const disk_path = path.join(process.cwd(), media_config.MEDIA_STORAGE_ROOT, storage_key);

    if (!disk_path.startsWith(path.resolve(media_config.MEDIA_STORAGE_ROOT))) {
      throw_error(MEDIA_ERROR.PATH_TRAVERSAL);
    }

    await mkdir(path.dirname(disk_path), { recursive: true });
    await writeFile(disk_path, final_buffer);

    const kind = detect_kind(mime_type);

    let variants: ImageSizes | null = null;
    let blur_hash: string | null = null;

    if (kind === "image" && mime_type !== "image/svg+xml" && options?.skip_optimization !== true) {
      try {
        variants = await optimize_image(final_buffer, storage_key, {
          strip_metadata: true,
          quality: 82,
          convert_to: "webp",
        });

        blur_hash = await generate_blur_placeholder(variants.medium.storage_key);
      } catch (opt_error) {
        logger.error("image_optimization_failed", {
          filename: original_name,
          error: opt_error instanceof Error ? opt_error.message : "unknown",
        });
      }
    }

    const id = generate_id();
    const record = {
      id,
      filename: path.basename(storage_key),
      original_name,
      mime_type,
      kind,
      size: final_buffer.length,
      width: options?.width ?? (variants ? variants.original.width : null),
      height: options?.height ?? (variants ? variants.original.height : null),
      url: variants?.original.url ?? build_public_media_url(storage_key),
      storage_key,
      provider: "local" as const,
      alt: options?.alt ?? null,
      caption: options?.caption ?? null,
      metadata: {
        variants: variants
          ? {
              thumbnail: variants.thumbnail,
              medium: variants.medium,
              original: variants.original,
            }
          : null,
        blur_hash,
        optimized: !!variants,
      },
      is_public: options?.is_public ?? true,
      uploaded_by: options?.uploaded_by ?? null,
    };

    const safe_record = {
      ...record,
      metadata: record.metadata,
    } as typeof record;

    await this.repo.create(safe_record);

    void audit_service.log({
      action: "media.upload",
      resource_type: "media_id",
      resource_id: id,
      metadata: {
        filename: original_name,
        mime_type,
        size: final_buffer.length,
        kind,
        has_variants: !!variants,
      },
    });

    return this.get_by_id(id) as unknown as UploadResult;
  }

  async generate_variants(id: string): Promise<ImageSizes | null> {
    const item = await this.repo.find_by_id(id);
    if (!item) throw_error(MEDIA_ERROR.NOT_FOUND);

    if (item.kind !== "image") return null;
    if (item.mime_type === "image/svg+xml") return null;

    const disk_path = path.join(
      process.cwd(),
      media_config.MEDIA_STORAGE_ROOT,
      item.storage_key,
    );

    const { readFile } = await import("fs/promises");
    const buffer = await readFile(disk_path);

    const variants = await optimize_image(buffer, item.storage_key, {
      strip_metadata: true,
      quality: 82,
      convert_to: "webp",
    });

    const blur_hash = await generate_blur_placeholder(variants.medium.storage_key);

    const metadata = {
      ...(item.metadata as Record<string, unknown>),
      variants: {
        thumbnail: variants.thumbnail,
        medium: variants.medium,
        original: variants.original,
      },
      blur_hash,
      optimized: true,
    };

    await this.repo.update(id, { metadata });

    return variants;
  }

  async regenerate_variants(id: string): Promise<ImageSizes | null> {
    await delete_variants((await this.get_by_id(id)).storage_key);
    return this.generate_variants(id);
  }

  async delete(id: string) {
    const item = await this.repo.find_by_id(id);
    if (!item) throw_error(MEDIA_ERROR.NOT_FOUND);

    if (item.provider === "local") {
      try {
        const disk_path = path.join(
          process.cwd(),
          media_config.MEDIA_STORAGE_ROOT,
          item.storage_key,
        );
        await unlink(disk_path);
      } catch {}

      try {
        await delete_variants(item.storage_key);
      } catch {}
    }

    await this.repo.delete_usages_by_media(id);
    await this.repo.delete(id);

    void audit_service.log({
      action: "media.delete",
      resource_type: "media_id",
      resource_id: id,
      metadata: {
        filename: item.original_name,
        storage_key: item.storage_key,
      },
    });

    return { ok: true };
  }

  async update(
    id: string,
    data: { alt?: string | null; caption?: string | null; is_public?: boolean },
  ) {
    const item = await this.repo.find_by_id(id);
    if (!item) throw_error(MEDIA_ERROR.NOT_FOUND);

    const update_data: Record<string, unknown> = {};
    if (data.alt !== undefined) update_data.alt = data.alt;
    if (data.caption !== undefined) update_data.caption = data.caption;
    if (data.is_public !== undefined) update_data.is_public = data.is_public;

    if (Object.keys(update_data).length > 0) {
      await this.repo.update(id, update_data);
    }

    return this.repo.find_by_id(id);
  }

  async attach_to_entity(
    media_id: string,
    input: {
      entity_type: string;
      entity_id: string;
      field?: string | null;
      is_primary?: boolean;
      sort_order?: number;
    },
  ) {
    const item = await this.repo.find_by_id(media_id);
    if (!item) throw_error(MEDIA_ERROR.NOT_FOUND);

    if (input.is_primary && input.field) {
      await this.repo.clear_primary_for_entity(input.entity_type, input.entity_id, input.field);
    }

    const usage_id = generate_id();
    await this.repo.create_usage({
      id: usage_id,
      media_id,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      field: input.field ?? null,
      sort_order: input.sort_order ?? 0,
      is_primary: input.is_primary ?? false,
      metadata: {},
    });

    void audit_service.log({
      action: "media.attach",
      resource_type: input.entity_type,
      resource_id: input.entity_id,
      metadata: { media_id, field: input.field },
    });

    return this.repo.find_by_id(media_id);
  }

  async detach_from_entity(usage_id: string) {
    const usage = await this.repo.find_usage_by_id(usage_id);
    if (!usage) throw_error(MEDIA_ERROR.USAGE_NOT_FOUND);

    await this.repo.delete_usage(usage_id);

    void audit_service.log({
      action: "media.detach",
      resource_type: "media_usage",
      resource_id: usage_id,
    });

    return { ok: true };
  }

  async stats() {
    return this.repo.get_stats();
  }
}

export const media_service = new MediaService();
