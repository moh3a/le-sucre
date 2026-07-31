import "server-only";

import { and, count, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlists } from "../db/schema";
import type { Wishlist } from "../types";

export class WishlistRepository {
  async find_by_id(id: string): Promise<Wishlist | null> {
    const [row] = await db.select().from(wishlists).where(eq(wishlists.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_customer_and_slug(customer_id: string, slug: string): Promise<Wishlist | null> {
    const [row] = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.customer_id, customer_id), eq(wishlists.slug, slug)))
      .limit(1);
    return row ?? null;
  }

  async find_default(customer_id: string): Promise<Wishlist | null> {
    const [row] = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.customer_id, customer_id), eq(wishlists.is_default, true)))
      .limit(1);
    return row ?? null;
  }

  async find_by_customer(customer_id: string): Promise<Wishlist[]> {
    return db
      .select()
      .from(wishlists)
      .where(eq(wishlists.customer_id, customer_id))
      .orderBy(desc(wishlists.sort_order), desc(wishlists.created_at));
  }

  async list_by_customer(
    customer_id: string,
    page: number,
    limit: number,
  ): Promise<{ items: Wishlist[]; total: number }> {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(wishlists)
        .where(eq(wishlists.customer_id, customer_id))
        .orderBy(desc(wishlists.sort_order), desc(wishlists.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(wishlists)
        .where(eq(wishlists.customer_id, customer_id)),
    ]);
    return { items, total: Number(total) };
  }

  async count_by_customer(customer_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(wishlists)
      .where(eq(wishlists.customer_id, customer_id));
    return Number(row.total);
  }

  async create(data: typeof wishlists.$inferInsert): Promise<void> {
    await db.insert(wishlists).values(data);
  }

  async update(id: string, data: Partial<typeof wishlists.$inferInsert>): Promise<void> {
    await db.update(wishlists).set(data).where(eq(wishlists.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(wishlists).where(eq(wishlists.id, id));
  }

  async unset_default_for_customer(customer_id: string): Promise<void> {
    await db
      .update(wishlists)
      .set({ is_default: false })
      .where(and(eq(wishlists.customer_id, customer_id), eq(wishlists.is_default, true)));
  }

  async increment_item_count(id: string): Promise<void> {
    await db
      .update(wishlists)
      .set({ item_count: sql`${wishlists.item_count} + 1` })
      .where(eq(wishlists.id, id));
  }

  async decrement_item_count(id: string): Promise<void> {
    await db
      .update(wishlists)
      .set({ item_count: sql`GREATEST(${wishlists.item_count} - 1, 0)` })
      .where(eq(wishlists.id, id));
  }

  async increment_shared_count(id: string): Promise<void> {
    await db
      .update(wishlists)
      .set({ shared_count: sql`${wishlists.shared_count} + 1` })
      .where(eq(wishlists.id, id));
  }

  async get_total_wishlists(): Promise<number> {
    const [row] = await db.select({ total: count() }).from(wishlists);
    return Number(row.total);
  }

  async get_active_wishlists_count(since?: string): Promise<number> {
    const conditions = since
      ? [sql`${wishlists.updated_at} >= ${since}`]
      : [];
    const [row] = await db
      .select({ total: count() })
      .from(wishlists)
      .where(and(...(conditions.length > 0 ? conditions : [sql`1=1`])));
    return Number(row.total);
  }
}

export const wishlist_repository = new WishlistRepository();
