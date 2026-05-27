import "server-only";
import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, product_translations, product_media } from "../schema";
import type { ProductStatus } from "../models/product.dto";

const DEFAULT_LOCALE = "fr";

export class ProductRepository {
  async find_by_id(id: string) {
    const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_slug(slug: string) {
    const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return row ?? null;
  }

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProductStatus;
    brand_id?: string;
    category_ids?: string[];
    product_ids?: string[];
  }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const filters = [];
    if (params.status) filters.push(eq(products.status, params.status));
    if (params.brand_id) filters.push(eq(products.brand_id, params.brand_id));
    if (params.category_ids?.length)
      filters.push(inArray(products.category_id, params.category_ids));
    if (params.product_ids?.length) filters.push(inArray(products.id, params.product_ids));
    if (params.search && !params.product_ids?.length) {
      const q = `%${params.search}%`;
      filters.push(or(like(products.slug, q), like(products.sku, q))!);
    }
    const where = filters.length ? and(...filters) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          status: products.status,
          base_price: products.base_price,
          offer_price: products.offer_price,
          category_id: products.category_id,
          brand_id: products.brand_id,
          is_featured: products.is_featured,
          created_at: products.created_at,
          name: product_translations.name,
        })
        .from(products)
        .leftJoin(
          product_translations,
          and(
            eq(product_translations.product_id, products.id),
            eq(product_translations.locale, DEFAULT_LOCALE),
          ),
        )
        .where(where)
        .orderBy(desc(products.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(products).where(where),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.ceil(total_records / limit) || 1;

    return {
      items,
      meta: { page, limit, total_records, total_pages, has_more: page < total_pages },
    };
  }

  create(data: typeof products.$inferInsert) {
    return db.insert(products).values(data);
  }

  update(id: string, data: Partial<typeof products.$inferInsert>) {
    return db.update(products).set(data).where(eq(products.id, id));
  }

  delete(id: string) {
    return db.delete(products).where(eq(products.id, id));
  }

  upsert_translation(data: typeof product_translations.$inferInsert) {
    return db
      .insert(product_translations)
      .values(data)
      .onDuplicateKeyUpdate({
        set: {
          name: data.name,
          description: data.description ?? null,
          keywords: data.keywords ?? null,
          seo_title: data.seo_title ?? null,
          seo_description: data.seo_description ?? null,
        },
      });
  }

  async list_translations(product_id: string) {
    return db
      .select()
      .from(product_translations)
      .where(eq(product_translations.product_id, product_id));
  }

  create_media(data: typeof product_media.$inferInsert) {
    return db.insert(product_media).values(data);
  }

  async list_media(product_id: string) {
    return db
      .select()
      .from(product_media)
      .where(eq(product_media.product_id, product_id))
      .orderBy(product_media.sort_order);
  }

  async clear_primary_media(product_id: string) {
    await db
      .update(product_media)
      .set({ is_primary: false })
      .where(eq(product_media.product_id, product_id));
  }

  async delete_media(media_id: string, product_id: string) {
    await db
      .delete(product_media)
      .where(and(eq(product_media.id, media_id), eq(product_media.product_id, product_id)));
  }

  async get_translation(product_id: string, locale: string) {
    const [row] = await db
      .select()
      .from(product_translations)
      .where(
        and(
          eq(product_translations.product_id, product_id),
          eq(product_translations.locale, locale),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async search_ids_by_name(search: string) {
    const q = `%${search}%`;
    const rows = await db
      .select({ product_id: product_translations.product_id })
      .from(product_translations)
      .where(like(product_translations.name, q));
    return rows.map((r) => r.product_id);
  }
}
