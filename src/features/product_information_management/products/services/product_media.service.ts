import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { PRODUCT_ERROR } from "../constants/error-codes";
import { build_product_media_key, build_public_media_url, media_config } from "@/config/media";

import type { product_media_dto } from "../models/product.dto";
import type { z } from "zod";
import { ProductRepository } from "../repositories/product.repository";

export type MediaUploadIntent = {
  storage_key: string;
  public_url: string;
  upload_url: string;
};

export class ProductMediaService {
  constructor(private readonly repo = new ProductRepository()) {}

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
    const storage_key = build_product_media_key(product_id, file.name);
    const disk_path = path.join(process.cwd(), media_config.MEDIA_STORAGE_ROOT, storage_key);
    await mkdir(path.dirname(disk_path), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(disk_path, buffer);
    return {
      storage_key,
      public_url: build_public_media_url(storage_key),
      filename: file.name,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
    };
  }

  async attach_media(
    input: z.infer<typeof product_media_dto> & { metadata?: Record<string, unknown> },
  ) {
    await this.assert_product_exists(input.product_id);
    if (input.is_primary) {
      await this.repo.clear_primary_media(input.product_id);
    }
    const id = generate_id();
    await this.repo.create_media({
      id,
      product_id: input.product_id,
      url: input.url,
      filename: input.filename ?? null,
      mime_type: input.mime_type ?? null,
      kind: input.kind,
      alt: input.alt ?? null,
      sort_order: input.sort_order,
      metadata: {
        ...(input.metadata ?? {}),
        storage_key: input.metadata?.storage_key,
      },
      is_primary: input.is_primary,
    });
    return this.repo.list_media(input.product_id);
  }

  async remove_media(media_id: string, product_id: string) {
    await this.repo.delete_media(media_id, product_id);
    return this.repo.list_media(product_id);
  }
}

export const product_media_service = new ProductMediaService();
