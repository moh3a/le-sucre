import "server-only";

import { z } from "zod";

import { generate_id } from "@/lib/utils";
import { tryFn, AppError } from "@/lib/error_handling";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { PRODUCT_ERROR } from "../constants/error-codes";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { slugify_name } from "@/features/product_information_management/categories/repositories/category-tree.engine";
import {
  create_product_dto,
  product_details_dto,
  full_product_media_dto,
  type ProductStatus,
  update_product_dto,
  upsert_translation_dto,
} from "../models/product.dto";
import { product_repository } from "../repositories/product.repository";
import { product_units_repository } from "../repositories/product-units.repository";
import { product_media_service } from "./product_media.service";
import { invalidate_catalog_cache } from "@/features/product_information_management/catalog_discovery/helpers/invalidate-catalog-cache.helper";
import { indexing_service } from "../../recommendations/services/indexing.service";
import { invalidate_recommendations_for_product } from "../../recommendations/helpers/invalidate-recommendations.helper";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { AUDIT_ACTION } from "@/features/product_information_management/constants/audit-actions";
import { brand_service } from "@/features/product_information_management/brands/services/brand.service";
import { review_service } from "@/features/product_information_management/reviews/services/review.service";
import { variant_service } from "@/features/product_information_management/variants/services/variant.service";
import { sku_service } from "@/features/product_information_management/variants/services/sku.service";

const DEFAULT_LOCALE = "fr";

function db_error_reason(err: Error): { fr: string; en: string; ar: string } {
  const msg = err.message.toLowerCase();
  if (msg.includes("foreign key") || msg.includes("referenced")) {
    return {
      fr: "Une entité associée empêche cette opération",
      en: "An associated entity prevents this operation",
      ar: "كيان مرتبط يمنع هذا الإجراء",
    };
  }
  if (msg.includes("duplicate") || msg.includes("unique")) {
    return {
      fr: "Un enregistrement similaire existe déjà",
      en: "A similar record already exists",
      ar: "يوجد سجل مشابه بالفعل",
    };
  }
  if (msg.includes("not null")) {
    return {
      fr: "Un champ obligatoire est manquant",
      en: "A required field is missing",
      ar: "حقول مطلوبة مفقودة",
    };
  }
  if (msg.includes("data too long")) {
    return {
      fr: "Le contenu dépasse la taille maximale autorisée",
      en: "The content exceeds the maximum allowed size",
      ar: "المحتوى يتجاوز الحد الأقصى المسموح به",
    };
  }
  if (msg.includes("connection") || msg.includes("connect")) {
    return {
      fr: "La connexion à la base de données est interrompue",
      en: "The database connection has been lost",
      ar: "تم فقدان اتصال قاعدة البيانات",
    };
  }
  return {
    fr: "Erreur interne du serveur",
    en: "Internal server error",
    ar: "خطأ داخلي في الخادم",
  };
}

export class ProductService {
  async create(input: z.infer<typeof create_product_dto>) {
    const slug = input.slug ?? slugify_name(input.name);
    if (await product_repository.find_by_slug(slug)) {
      throw_error(PRODUCT_ERROR.SLUG_CONFLICT);
    }

    if ((await product_repository.count_by_sku(input.sku)) > 0) {
      throw_error(PRODUCT_ERROR.SKU_CONFLICT);
    }

    const resolved_ids = await category_service.resolve_filter_ids(input.category_id, false);
    if (!resolved_ids.length) throw_error(PRODUCT_ERROR.CATEGORY_NOT_FOUND);

    const id = generate_id();

    await product_repository.create({
      id,
      sku: input.sku,
      slug,
      category_id: input.category_id,
      brand_id: input.brand_id ?? null,
      base_price: String(input.base_price),
      offer_price: input.offer_price != null ? String(input.offer_price) : null,
      currency: input.currency,
      status: input.status,
      has_variants: input.has_variants ?? false,
      is_featured: input.is_featured,
      metadata: input.metadata ?? {},
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
      seo_keywords: input.keywords ?? null,
    });

    await product_repository.upsert_translation({
      id: generate_id(),
      product_id: id,
      locale: DEFAULT_LOCALE,
      name: input.name,
      description: input.description ?? null,
      keywords: input.keywords ?? null,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
    });

    // Create default retail + wholesale units
    await product_units_repository.ensure_default_units(id, {
      retail_unit_name: input.retail_unit_name ?? "pièce",
      wholesale_unit_name: input.wholesale_unit_name ?? "carton",
      wholesale_pieces_per_unit: input.wholesale_pieces_per_unit ?? 1,
      base_price: String(input.base_price),
      offer_price: input.offer_price != null ? String(input.offer_price) : null,
      wholesale_base_price:
        input.wholesale_base_price != null ? String(input.wholesale_base_price) : null,
      wholesale_offer_price:
        input.wholesale_offer_price != null ? String(input.wholesale_offer_price) : null,
      currency: input.currency,
    });

    void invalidate_catalog_cache();
    void invalidate_recommendations_for_product(id);
    void audit_service.log({
      action: AUDIT_ACTION.PRODUCT_CREATED,
      resource_type: "product_id",
      resource_id: id,
    });
    return this.get_by_id(id);
  }

  async get_by_id(id: string) {
    const productData = await product_repository.find_by_id(id);
    if (!productData) throw_error(PRODUCT_ERROR.NOT_FOUND);
    const product = product_details_dto.parse(productData);
    const translations = await product_repository.list_translations(id);
    const mediaData = await product_repository.list_media(id);
    const media = z.array(full_product_media_dto).parse(mediaData);
    const units = await product_units_repository.list_by_product(id);
    return { product, translations, media, units };
  }

  async get_by_slug(slug: string, locale = DEFAULT_LOCALE) {
    const product = await product_repository.find_by_slug(slug);
    if (!product) throw_error(PRODUCT_ERROR.NOT_FOUND);
    const translation =
      (await product_repository.get_translation(product.id, locale)) ??
      (await product_repository.get_translation(product.id, DEFAULT_LOCALE));
    const media = await product_repository.list_media(product.id);
    return { product, translation, media };
  }

  async get_storefront_by_slug(slug: string, locale = DEFAULT_LOCALE) {
    const product = await product_repository.find_by_slug(slug);
    if (!product) throw_error(PRODUCT_ERROR.NOT_FOUND);

    const translation =
      (await product_repository.get_translation(product.id, locale)) ??
      (await product_repository.get_translation(product.id, DEFAULT_LOCALE));

    const media = await product_repository.list_media(product.id);

    const parsed = product_details_dto.parse(product);

    let brand = null;
    if (product.brand_id) {
      try {
        const b = await brand_service.get_by_id(product.brand_id);
        brand = { id: b.id, name: b.name, slug: b.slug, logo_url: b.logo_url };
      } catch {
        // brand might have been deleted
      }
    }

    let category = null;
    const cat = await category_service.find_by_id(product.category_id);
    if (cat) {
      category = { id: cat.id, name: cat.name, slug: cat.slug };
    }

    let review_summary = null;
    try {
      review_summary = await review_service.get_product_summary(product.id);
    } catch {
      // reviews may be empty for new products
    }

    let variant_config = null;
    let sku_list = null;
    try {
      if (parsed.has_variants) {
        variant_config = await variant_service.get_variant_config(product.id);
      }
      const sku_result = await sku_service.list_by_product(product.id);
      sku_list = sku_result.items;
    } catch {
      // SKU or variant data may be unavailable
    }

    const product_units = await product_units_repository.list_by_product(product.id);

    return {
      product: parsed,
      translation,
      media,
      brand,
      category,
      review_summary,
      variant_config,
      sku_list,
      product_units,
    };
  }

  async update(input: z.infer<typeof update_product_dto>) {
    const current = await product_repository.find_by_id(input.id);
    if (!current) throw_error(PRODUCT_ERROR.NOT_FOUND);

    if (
      input.slug &&
      input.slug !== current.slug &&
      (await product_repository.find_by_slug(input.slug))
    ) {
      throw_error(PRODUCT_ERROR.SLUG_CONFLICT);
    }

    if (
      input.sku &&
      input.sku !== current.sku &&
      (await product_repository.count_by_sku(input.sku, input.id)) > 0
    ) {
      throw_error(PRODUCT_ERROR.SKU_CONFLICT);
    }

    if (input.category_id) {
      const resolved = await category_service.resolve_filter_ids(input.category_id, false);
      if (!resolved.length) throw_error(PRODUCT_ERROR.CATEGORY_NOT_FOUND);
    }

    await product_repository.update(input.id, {
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
      const existing = await product_repository.get_translation(input.id, DEFAULT_LOCALE);
      await product_repository.upsert_translation({
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

    // Update retail unit if price or unit name changed
    if (
      input.base_price !== undefined ||
      input.offer_price !== undefined ||
      input.retail_unit_name !== undefined
    ) {
      const retail_unit = await product_units_repository.get_by_channel(input.id, "retail");
      if (retail_unit) {
        await product_units_repository.upsert({
          product_id: input.id,
          channel: "retail",
          unit_name: input.retail_unit_name ?? retail_unit.unit_name,
          pieces_per_unit: retail_unit.pieces_per_unit,
          base_price: input.base_price != null ? String(input.base_price) : retail_unit.base_price,
          offer_price:
            input.offer_price !== undefined
              ? input.offer_price != null
                ? String(input.offer_price)
                : null
              : retail_unit.offer_price,
          currency: input.currency ?? retail_unit.currency,
        });
      }
    }

    // Update wholesale unit if wholesale-specific fields changed
    if (
      input.wholesale_base_price !== undefined ||
      input.wholesale_offer_price !== undefined ||
      input.wholesale_unit_name !== undefined ||
      input.wholesale_pieces_per_unit !== undefined
    ) {
      const wholesale_unit = await product_units_repository.get_by_channel(input.id, "wholesale");
      if (wholesale_unit) {
        await product_units_repository.upsert({
          product_id: input.id,
          channel: "wholesale",
          unit_name: input.wholesale_unit_name ?? wholesale_unit.unit_name,
          pieces_per_unit: input.wholesale_pieces_per_unit ?? wholesale_unit.pieces_per_unit,
          base_price:
            input.wholesale_base_price != null
              ? String(input.wholesale_base_price)
              : wholesale_unit.base_price,
          offer_price:
            input.wholesale_offer_price !== undefined
              ? input.wholesale_offer_price != null
                ? String(input.wholesale_offer_price)
                : null
              : wholesale_unit.offer_price,
          currency: input.currency ?? wholesale_unit.currency,
        });
      }
    }

    void invalidate_catalog_cache();
    void invalidate_recommendations_for_product(input.id);
    void indexing_service.enqueue("reindex_product", { product_id: input.id });

    void audit_service.log({
      action: AUDIT_ACTION.PRODUCT_UPDATED,
      resource_type: "product_id",
      resource_id: input.id,
    });
    return this.get_by_id(input.id);
  }

  async upsert_translation(input: z.infer<typeof upsert_translation_dto>) {
    await this.get_by_id(input.product_id);
    await product_repository.upsert_translation({
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
    const current = await product_repository.find_by_id(id);
    if (!current) throw_error(PRODUCT_ERROR.NOT_FOUND);

    if (await product_repository.has_orders(id)) {
      throw_error(PRODUCT_ERROR.HAS_ACTIVE_ORDERS);
    }

    await product_repository.delete(id);

    void invalidate_catalog_cache();
    void invalidate_recommendations_for_product(id);

    void audit_service.log({
      action: AUDIT_ACTION.PRODUCT_REMOVED,
      resource_type: "product_id",
      resource_id: id,
    });
    return { ok: true };
  }

  async duplicate(id: string) {
    const original = await product_repository.find_by_id(id);
    if (!original) throw_error(PRODUCT_ERROR.NOT_FOUND);

    const new_id = generate_id();
    const copy_slug = `${original.slug}-copie-${Date.now().toString(36)}`;

    const [create_err] = await tryFn(
      product_repository.create({
        id: new_id,
        sku: `${original.sku}-COPY`,
        slug: copy_slug,
        category_id: original.category_id,
        brand_id: original.brand_id,
        base_price: original.base_price,
        offer_price: original.offer_price,
        currency: original.currency,
        status: "draft",
        has_variants: original.has_variants,
        is_featured: false,
        metadata: original.metadata,
        seo_title: original.seo_title,
        seo_description: original.seo_description,
        seo_keywords: original.seo_keywords,
      }),
    );
    if (create_err) {
      if (create_err instanceof AppError) throw create_err;
      const reasons = db_error_reason(create_err);
      throw new AppError(reasons.fr, "PRODUCT_DUPLICATE_FAILED", 500, {
        _messages: PRODUCT_ERROR.DUPLICATE_FAILED.message,
      });
    }

    const translations = await product_repository.list_translations(id);
    for (const tr of translations) {
      const [tr_err] = await tryFn(
        product_repository.upsert_translation({
          id: generate_id(),
          product_id: new_id,
          locale: tr.locale,
          name: `${tr.name} (copie)`,
          description: tr.description,
          keywords: tr.keywords,
          seo_title: tr.seo_title,
          seo_description: tr.seo_description,
        }),
      );
      if (tr_err && !(tr_err instanceof AppError)) {
        const reasons = db_error_reason(tr_err);
        throw new AppError(reasons.fr, "PRODUCT_DUPLICATE_FAILED", 500, {
          _messages: PRODUCT_ERROR.DUPLICATE_FAILED.message,
        });
      }
    }

    // Duplicate product units
    const original_units = await product_units_repository.list_by_product(id);
    for (const unit of original_units) {
      await product_units_repository.upsert({
        product_id: new_id,
        channel: unit.channel as "retail" | "wholesale",
        unit_name: unit.unit_name,
        pieces_per_unit: unit.pieces_per_unit,
        base_price: unit.base_price,
        offer_price: unit.offer_price,
        currency: unit.currency,
        is_active: unit.is_active,
      });
    }

    void invalidate_catalog_cache();
    void invalidate_recommendations_for_product(new_id);
    void audit_service.log({
      action: AUDIT_ACTION.PRODUCT_DUPLICATED,
      resource_type: "product_id",
      resource_id: new_id,
    });

    return this.get_by_id(new_id);
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
      const name_ids = await product_repository.search_ids_by_name(params.search);
      const slug_matches = await product_repository.list({
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

    return product_repository.list({
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
