import "server-only";
import { and, count, desc, eq, inArray, isNotNull, isNull, like, ne, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, product_translations, product_media } from "../schema";
import { order_items } from "@/features/order_management_system/orders/schema";
import type { ProductStatus } from "../models/product.dto";

const DEFAULT_LOCALE = "fr";

export class ProductRepository {
  async find_by_id(id: string, includeDeleted = false) {
    const filters: any[] = [eq(products.id, id)];
    if (!includeDeleted) filters.push(isNull(products.deleted_at));
    const [row] = await db.select().from(products).where(and(...filters)).limit(1);
    return row ?? null;
  }

  async find_by_slug(slug: string, includeDeleted = false) {
    const filters: any[] = [eq(products.slug, slug)];
    if (!includeDeleted) filters.push(isNull(products.deleted_at));
    const [row] = await db.select().from(products).where(and(...filters)).limit(1);
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
    includeDeleted?: boolean;
  }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const filters = [];
    if (!params.includeDeleted) filters.push(isNull(products.deleted_at));
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

  /** Soft delete - only works on non-deleted records */
  async soft_delete(id: string, actorUserId?: string) {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    return db
      .update(products)
      .set({
        deleted_at: now,
        ...(actorUserId ? { deleted_by: actorUserId } : {}),
      })
      .where(and(eq(products.id, id), isNull(products.deleted_at)));
  }

  /** Restore a soft-deleted record */
  async restore(id: string, actorUserId?: string) {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    return db
      .update(products)
      .set({
        deleted_at: null,
        deleted_by: null,
        restored_at: now,
        ...(actorUserId ? { restored_by: actorUserId } : {}),
      })
      .where(and(eq(products.id, id), isNotNull(products.deleted_at)));
  }

  /** Permanently delete (force) */
  async force_delete(id: string) {
    return db.delete(products).where(eq(products.id, id));
  }

  /** List soft-deleted records (trash) */
  async list_deleted(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const where = isNotNull(products.deleted_at);

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          status: products.status,
          deleted_at: products.deleted_at,
          deleted_by: products.deleted_by,
        })
        .from(products)
        .where(where)
        .orderBy(desc(products.deleted_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(products).where(where),
    ]);

    const total_records = Number(total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.ceil(total_records / limit) || 1,
        has_more: page * limit < total_records,
      },
    };
  }

  async delete_media(media_id: string, product_id: string) {
    await db
      .delete(product_media)
      .where(and(eq(product_media.id, media_id), eq(product_media.product_id, product_id)));
  }

  async list_translations(product_id: string) {
    return db
      .select()
      .from(product_translations)
      .where(eq(product_translations.product_id, product_id));
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

  async has_orders(product_id: string): Promise<boolean> {
    const [{ total }] = await db
      .select({ total: count() })
      .from(order_items)
      .where(eq(order_items.product_id, product_id))
      .limit(1);
    return Number(total ?? 0) > 0;
  }

  async count_by_sku(sku: string, exclude_id?: string): Promise<number> {
    const filters = [eq(products.sku, sku)];
    if (exclude_id) {
      filters.push(ne(products.id, exclude_id));
    }
    const [{ total }] = await db
      .select({ total: count() })
      .from(products)
      .where(and(...filters))
      .limit(1);
    return Number(total ?? 0);
  }
}
