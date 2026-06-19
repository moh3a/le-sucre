import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections, collection_items } from "../db/schema";
import type { Collection, CollectionItem } from "../types";

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
