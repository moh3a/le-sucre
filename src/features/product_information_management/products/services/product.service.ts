import "server-only";

import type { z } from "zod";

import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { slugify_name } from "@/features/product_information_management/categories/repositories/category-tree.engine";

import {
  create_product_dto,
  type ProductStatus,
  update_product_dto,
  upsert_translation_dto,
} from "../models/product.dto";
import { ProductRepository } from "../repositories/product.repository";
import { product_media_service } from "./product_media.service";

const DEFAULT_LOCALE = "fr";

export class ProductService {
  constructor(private readonly repo = new ProductRepository()) {}

  async create(input: z.infer<typeof create_product_dto>) {
    const slug = input.slug ?? slugify_name(input.name);
    if (await this.repo.find_by_slug(slug)) {
      throw new ConflictError("Ce slug de produit existe déjà");
    }

    const resolved_ids = await category_service.resolve_filter_ids(input.category_id, false);
    if (!resolved_ids.length) throw new NotFoundError("Catégorie introuvable");

    const id = generate_id();

    await this.repo.create({
      id,
      sku: input.sku,
      slug,
      category_id: input.category_id,
      brand_id: input.brand_id ?? null,
      base_price: String(input.base_price),
      offer_price: input.offer_price != null ? String(input.offer_price) : null,
      currency: input.currency,
      status: input.status,
      is_featured: input.is_featured,
      metadata: input.metadata ?? {},
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
      seo_keywords: input.keywords ?? null,
    });

    await this.repo.upsert_translation({
      id: generate_id(),
      product_id: id,
      locale: DEFAULT_LOCALE,
      name: input.name,
      description: input.description ?? null,
      keywords: input.keywords ?? null,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
    });

    return this.get_by_id(id);
  }

  async get_by_id(id: string) {
    const product = await this.repo.find_by_id(id);
    if (!product) throw new NotFoundError("Produit introuvable");
    const translations = await this.repo.list_translations(id);
    const media = await this.repo.list_media(id);
    return { product, translations, media };
  }

  async get_by_slug(slug: string, locale = DEFAULT_LOCALE) {
    const product = await this.repo.find_by_slug(slug);
    if (!product) throw new NotFoundError("Produit introuvable");
    const translation =
      (await this.repo.get_translation(product.id, locale)) ??
      (await this.repo.get_translation(product.id, DEFAULT_LOCALE));
    const media = await this.repo.list_media(product.id);
    return { product, translation, media };
  }

  async update(input: z.infer<typeof update_product_dto>) {
    const current = await this.repo.find_by_id(input.id);
    if (!current) throw new NotFoundError("Produit introuvable");

    if (input.slug && input.slug !== current.slug && (await this.repo.find_by_slug(input.slug))) {
      throw new ConflictError("Ce slug de produit existe déjà");
    }

    if (input.category_id) {
      const resolved = await category_service.resolve_filter_ids(input.category_id, false);
      if (!resolved.length) throw new NotFoundError("Catégorie introuvable");
    }

    await this.repo.update(input.id, {
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.category_id !== undefined && { category_id: input.category_id }),
      ...(input.brand_id !== undefined && { brand_id: input.brand_id }),
      ...(input.base_price !== undefined && { base_price: String(input.base_price) }),
      ...(input.offer_price !== undefined && {
        offer_price: input.offer_price != null ? String(input.offer_price) : null,
      }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.is_featured !== undefined && { is_featured: input.is_featured }),
      ...(input.metadata !== undefined && { metadata: input.metadata }),
      ...(input.seo_title !== undefined && { seo_title: input.seo_title }),
      ...(input.seo_description !== undefined && { seo_description: input.seo_description }),
      ...(input.keywords !== undefined && { seo_keywords: input.keywords }),
    });

    if (
      input.name !== undefined ||
      input.description !== undefined ||
      input.keywords !== undefined
    ) {
      const existing = await this.repo.get_translation(input.id, DEFAULT_LOCALE);
      await this.repo.upsert_translation({
        id: existing?.id ?? generate_id(),
        product_id: input.id,
        locale: DEFAULT_LOCALE,
        name: input.name ?? existing?.name ?? "",
        description: input.description ?? existing?.description ?? null,
        keywords: input.keywords ?? existing?.keywords ?? null,
        seo_title: input.seo_title ?? existing?.seo_title ?? null,
        seo_description: input.seo_description ?? existing?.seo_description ?? null,
      });
    }

    return this.get_by_id(input.id);
  }

  async upsert_translation(input: z.infer<typeof upsert_translation_dto>) {
    await this.get_by_id(input.product_id);
    await this.repo.upsert_translation({
      id: generate_id(),
      product_id: input.product_id,
      locale: input.locale,
      name: input.name,
      description: input.description ?? null,
      keywords: input.keywords ?? null,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
    });
    return this.get_by_id(input.product_id);
  }

  async remove(id: string) {
    const current = await this.repo.find_by_id(id);
    if (!current) throw new NotFoundError("Produit introuvable");
    await this.repo.delete(id);
    return { ok: true };
  }

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProductStatus;
    brand_id?: string;
    category_id?: string;
  }) {
    const category_ids = params.category_id
      ? await category_service.resolve_filter_ids(params.category_id, true)
      : undefined;

    let product_ids: string[] | undefined;
    if (params.search) {
      const name_ids = await this.repo.search_ids_by_name(params.search);
      const slug_matches = await this.repo.list({
        page: 1,
        limit: 1000,
        search: params.search,
        category_ids,
      });
      const merged = new Set([...name_ids, ...slug_matches.items.map((i) => i.id)]);
      product_ids = [...merged];
      if (!product_ids.length) {
        return {
          items: [],
          meta: {
            page: params.page,
            limit: params.limit,
            total_records: 0,
            total_pages: 1,
            has_more: false,
          },
        };
      }
    }

    return this.repo.list({
      ...params,
      category_ids,
      product_ids,
      search: product_ids ? undefined : params.search,
    });
  }

  add_media = product_media_service.attach_media.bind(product_media_service);
  remove_media = product_media_service.remove_media.bind(product_media_service);
  create_upload_intent = product_media_service.create_upload_intent.bind(product_media_service);
}

export const product_service = new ProductService();
