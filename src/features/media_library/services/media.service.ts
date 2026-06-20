import "server-only";

import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

import { generate_id } from "@/lib/utils";
import { media_config, build_public_media_url } from "@/config/media";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { MEDIA_ERROR, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "../constants";
import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";
import { MediaRepository } from "../repositories/media.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

function build_media_key(filename: string): string {
  const safe_name = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const prefix = "library";
  return `${prefix}/${Date.now()}-${safe_name}`;
}

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
    },
  ) {
    if (!file || file.size === 0) throw_error(MEDIA_ERROR.UPLOAD_FAILED);

    const mime_type = file.type || "application/octet-stream";
    const kind = detect_kind(mime_type);

    const max_size =
      kind === "video" ? MAX_VIDEO_SIZE : kind === "image" ? MAX_IMAGE_SIZE : MAX_IMAGE_SIZE;

    if (file.size > max_size) throw_error(MEDIA_ERROR.FILE_TOO_LARGE);

    const storage_key = build_media_key(file.name);
    const disk_path = path.join(process.cwd(), media_config.MEDIA_STORAGE_ROOT, storage_key);

    await mkdir(path.dirname(disk_path), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(disk_path, buffer);

    const id = generate_id();
    const record = {
      id,
      filename: path.basename(storage_key),
      original_name: file.name,
      mime_type,
      kind,
      size: buffer.length,
      width: options?.width ?? null,
      height: options?.height ?? null,
      url: build_public_media_url(storage_key),
      storage_key,
      provider: "local" as const,
      alt: options?.alt ?? null,
      caption: options?.caption ?? null,
      metadata: {},
      is_public: options?.is_public ?? true,
      uploaded_by: options?.uploaded_by ?? null,
    };

    await this.repo.create(record);

    void audit_service.log({
      action: "media.upload",
      resource_type: "media_id",
      resource_id: id,
      metadata: {
        filename: file.name,
        mime_type,
        size: buffer.length,
        kind,
      },
    });

    return { ...record };
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
    const usage = await this.repo.find_by_id(usage_id);
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
