import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { PRODUCT_ERROR } from "../constants/error-codes";
import { build_product_media_key, build_public_media_url, media_config } from "@/config/media";
import { MediaRepository } from "@/features/media_library/repositories/media.repository";
import { build_media_storage_key } from "@/features/media_library/helpers";

import type { product_media_dto } from "../models/product.dto";
import type { z } from "zod";
import { ProductRepository } from "../repositories/product.repository";

export type MediaUploadIntent = {
  storage_key: string;
  public_url: string;
  upload_url: string;
};

export class ProductMediaService {
  constructor(
    private readonly repo = new ProductRepository(),
    private readonly media_repo = new MediaRepository(),
  ) {}

  async assert_product_exists(product_id: string) {
    const product = await this.repo.find_by_id(product_id);
    if (!product) throw_error(PRODUCT_ERROR.NOT_FOUND);
    return product;
  }

  /** CDN-ready storage key + public URL (presigned flow placeholder). */
  async create_upload_intent(product_id: string, filename: string, mime_type: string) {
    await this.assert_product_exists(product_id);
    const storage_key = build_product_media_key(product_id, filename);
    const public_url = build_public_media_url(storage_key);
    return {
      storage_key,
      public_url,
      upload_url: `/api/admin/products/${product_id}/media/upload`,
      mime_type,
    } satisfies MediaUploadIntent & { mime_type: string };
  }

  async save_local_file(product_id: string, file: File) {
    await this.assert_product_exists(product_id);

    const storage_key = build_media_storage_key(file.name);
    const disk_path = path.join(process.cwd(), media_config.MEDIA_STORAGE_ROOT, storage_key);

    if (!disk_path.startsWith(path.resolve(media_config.MEDIA_STORAGE_ROOT))) {
      throw_error({
        code: "PATH_TRAVERSAL",
        status: 400,
        message: { fr: "Tentative de path traversal", en: "Path traversal attempt", ar: "" },
      });
    }

    await mkdir(path.dirname(disk_path), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(disk_path, buffer);

    const mime_type = file.type || "application/octet-stream";
    const kind = mime_type.startsWith("image/")
      ? "image"
      : mime_type.startsWith("video/")
        ? "video"
        : mime_type.startsWith("audio/")
          ? "audio"
          : "document";

    const media_library_id = generate_id();
    const record = {
      id: media_library_id,
      filename: path.basename(storage_key),
      original_name: file.name,
      mime_type,
      kind,
      size: buffer.length,
      width: null,
      height: null,
      url: build_public_media_url(storage_key),
      storage_key,
      provider: "local" as const,
      alt: file.name,
      caption: null,
      metadata: {},
      is_public: true,
      uploaded_by: null,
    };

    await this.media_repo.create(record);

    return {
      media_library_id,
      storage_key,
      public_url: build_public_media_url(storage_key),
      filename: file.name,
      mime_type,
      size: file.size,
    };
  }

  private resolve_metadata(
    raw: string | null | undefined | Record<string, unknown>,
  ): Record<string, unknown> {
    if (!raw) return {};
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return raw as Record<string, unknown>;
  }

  async attach_media(input: {
    product_id: string;
    url: string;
    filename?: string | null;
    mime_type?: string | null;
    kind: "image" | "video" | "document";
    alt?: string | null;
    sort_order: number;
    metadata?: string | Record<string, unknown> | null;
    is_primary: boolean;
  }) {
    await this.assert_product_exists(input.product_id);
    if (input.is_primary) {
      await this.repo.clear_primary_media(input.product_id);
    }
    const id = generate_id();
    const metadata = this.resolve_metadata(input.metadata);
    await this.repo.create_media({
      id,
      product_id: input.product_id,
      url: input.url,
      filename: input.filename ?? null,
      mime_type: input.mime_type ?? null,
      kind: input.kind,
      alt: input.alt ?? null,
      sort_order: input.sort_order,
      metadata,
      is_primary: input.is_primary,
    });

    const storage_key = metadata.storage_key as string | undefined;
    if (storage_key) {
      const existing = await this.media_repo.find_by_storage_key(storage_key);
      if (existing) {
        const usage_id = generate_id();
        await this.media_repo.create_usage({
          id: usage_id,
          media_id: existing.id,
          entity_type: "product",
          entity_id: input.product_id,
          field: input.kind === "video" ? "video" : "image",
          sort_order: input.sort_order,
          is_primary: input.is_primary,
          metadata: { product_media_id: id },
        });
      }
    }

    return this.repo.list_media(input.product_id);
  }

  async remove_media(media_id: string, product_id: string) {
    const media_items = await this.repo.list_media(product_id);
    const target = media_items.find((m) => m.id === media_id);
    if (!target) return this.repo.list_media(product_id);

    const storage_key = (target.metadata as Record<string, unknown> | null)?.storage_key as
      | string
      | undefined;
    if (storage_key) {
      const existing = await this.media_repo.find_by_storage_key(storage_key);
      if (existing) {
        const usages = await this.media_repo.get_entity_usages("product", product_id);
        const match = usages.find(
          (u) => u.media_id === existing.id && (u.metadata as Record<string, unknown> | null)?.product_media_id === media_id,
        );
        if (match) {
          await this.media_repo.delete_usage(match.id);
        }
      }
    }

    await this.repo.delete_media(media_id, product_id);
    return this.repo.list_media(product_id);
  }
}

export const product_media_service = new ProductMediaService();
