import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections, collection_items } from "../db/schema";
import { products, product_translations, product_media } from "@/features/product_information_management/products/schema";
import type { Collection, CollectionItem, CollectionItemWithProduct } from "../types";

export class CollectionRepository {
  async find_by_id(id: string): Promise<Collection | null> {
    const [row] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_customer_and_slug(customer_id: string, slug: string): Promise<Collection | null> {
    const [row] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.customer_id, customer_id), eq(collections.slug, slug)))
      .limit(1);
    return row ?? null;
  }

  async find_by_customer(customer_id: string): Promise<Collection[]> {
    return db
      .select()
      .from(collections)
      .where(eq(collections.customer_id, customer_id))
      .orderBy(desc(collections.sort_order), desc(collections.created_at));
  }

  async list_public(page: number, limit: number): Promise<{ items: Collection[]; total: number }> {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(collections)
        .where(eq(collections.is_public, true))
        .orderBy(desc(collections.item_count), desc(collections.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(collections)
        .where(eq(collections.is_public, true)),
    ]);
    return { items, total: Number(total) };
  }

  async list_by_customer(
    customer_id: string,
    page: number,
    limit: number,
    is_public?: boolean,
  ): Promise<{ items: Collection[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof eq>[] = [eq(collections.customer_id, customer_id)];
    if (is_public !== undefined) conditions.push(eq(collections.is_public, is_public));

    const where = and(...conditions);
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(collections)
        .where(where)
        .orderBy(desc(collections.sort_order), desc(collections.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(collections).where(where),
    ]);
    return { items, total: Number(total) };
  }

  async count_by_customer(customer_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(collections)
      .where(eq(collections.customer_id, customer_id));
    return Number(row.total);
  }

  async create(data: typeof collections.$inferInsert): Promise<void> {
    await db.insert(collections).values(data);
  }

  async update(id: string, data: Partial<typeof collections.$inferInsert>): Promise<void> {
    await db.update(collections).set(data).where(eq(collections.id, id));
  }

  async find_by_share_token(share_token: string): Promise<Collection | null> {
    const [row] = await db
      .select()
      .from(collections)
      .where(eq(collections.share_token, share_token))
      .limit(1);
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id));
  }

  async increment_item_count(id: string): Promise<void> {
    await db
      .update(collections)
      .set({ item_count: sql`${collections.item_count} + 1` })
      .where(eq(collections.id, id));
  }

  async decrement_item_count(id: string): Promise<void> {
    await db
      .update(collections)
      .set({ item_count: sql`GREATEST(${collections.item_count} - 1, 0)` })
      .where(eq(collections.id, id));
  }
}

export class CollectionItemRepository {
  async find_by_id(id: string): Promise<CollectionItem | null> {
    const [row] = await db.select().from(collection_items).where(eq(collection_items.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_collection_and_product(
    collection_id: string,
    product_id: string,
    variant_id: string | null,
  ): Promise<CollectionItem | null> {
    const conditions = variant_id
      ? and(
          eq(collection_items.collection_id, collection_id),
          eq(collection_items.product_id, product_id),
          eq(collection_items.variant_id, variant_id),
        )
      : and(
          eq(collection_items.collection_id, collection_id),
          eq(collection_items.product_id, product_id),
          sql`${collection_items.variant_id} IS NULL`,
        );
    const [row] = await db.select().from(collection_items).where(conditions).limit(1);
    return row ?? null;
  }

  async list_by_collection(
    collection_id: string,
    page: number,
    limit: number,
  ): Promise<{ items: CollectionItem[]; total: number }> {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(collection_items)
        .where(eq(collection_items.collection_id, collection_id))
        .orderBy(asc(collection_items.sort_order), desc(collection_items.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(collection_items)
        .where(eq(collection_items.collection_id, collection_id)),
    ]);
    return { items, total: Number(total) };
  }

  async get_items_with_products(
    collection_id: string,
  ): Promise<CollectionItemWithProduct[]> {
    const rows = await db
      .select({
        id: collection_items.id,
        collection_id: collection_items.collection_id,
        product_id: collection_items.product_id,
        variant_id: collection_items.variant_id,
        notes: collection_items.notes,
        sort_order: collection_items.sort_order,
        created_at: collection_items.created_at,
        product_id_ref: products.id,
        product_slug: products.slug,
        product_base_price: products.base_price,
        product_offer_price: products.offer_price,
        product_currency: products.currency,
        translation_locale: product_translations.locale,
        translation_name: product_translations.name,
        media_url: product_media.url,
        media_is_primary: product_media.is_primary,
      })
      .from(collection_items)
      .leftJoin(products, eq(collection_items.product_id, products.id))
      .leftJoin(
        product_translations,
        eq(products.id, product_translations.product_id),
      )
      .leftJoin(product_media, eq(products.id, product_media.product_id))
      .where(eq(collection_items.collection_id, collection_id))
      .orderBy(asc(collection_items.sort_order), desc(collection_items.created_at));

    const grouped = new Map<
      string,
      CollectionItemWithProduct & {
        _translations: Map<string, string>;
        _media: Array<{ url: string; is_primary: boolean }>;
      }
    >();

    for (const row of rows) {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          collection_id: row.collection_id,
          product_id: row.product_id,
          variant_id: row.variant_id,
          notes: row.notes,
          sort_order: row.sort_order,
          created_at: row.created_at,
          product: row.product_id_ref
            ? {
                id: row.product_id_ref,
                slug: row.product_slug ?? "",
                base_price: row.product_base_price ?? "0",
                offer_price: row.product_offer_price,
                currency: row.product_currency ?? "DZD",
                translations: [],
                media: [],
              }
            : undefined,
          _translations: new Map(),
          _media: [],
        });
      }

      const entry = grouped.get(row.id)!;
      if (row.translation_locale && row.translation_name) {
        entry._translations.set(row.translation_locale, row.translation_name);
      }
      if (row.media_url) {
        entry._media.push({
          url: row.media_url,
          is_primary: row.media_is_primary ?? false,
        });
      }
    }

    return Array.from(grouped.values()).map(({ _translations, _media, ...rest }) => {
      if (rest.product) {
        rest.product.translations = Array.from(_translations.entries()).map(
          ([locale, name]) => ({ locale, name }),
        );
        rest.product.media = _media;
      }
      return rest as CollectionItemWithProduct;
    });
  }

  async create(data: typeof collection_items.$inferInsert): Promise<void> {
    await db.insert(collection_items).values(data);
  }

  async delete(id: string): Promise<void> {
    await db.delete(collection_items).where(eq(collection_items.id, id));
  }

  async delete_by_collection(collection_id: string): Promise<void> {
    await db.delete(collection_items).where(eq(collection_items.collection_id, collection_id));
  }
}

export const collection_repository = new CollectionRepository();
export const collection_item_repository = new CollectionItemRepository();
