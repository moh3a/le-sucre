import "server-only";

import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlist_items, wishlists } from "../db/schema";
import type { WishlistItem } from "../types";

export class WishlistItemRepository {
  async find_by_id(id: string): Promise<WishlistItem | null> {
    const [row] = await db.select().from(wishlist_items).where(eq(wishlist_items.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_wishlist_and_product(
    wishlist_id: string,
    product_id: string,
    variant_id: string | null,
  ): Promise<WishlistItem | null> {
    const conditions = variant_id
      ? and(
          eq(wishlist_items.wishlist_id, wishlist_id),
          eq(wishlist_items.product_id, product_id),
          eq(wishlist_items.variant_id, variant_id),
        )
      : and(
          eq(wishlist_items.wishlist_id, wishlist_id),
          eq(wishlist_items.product_id, product_id),
          sql`${wishlist_items.variant_id} IS NULL`,
        );
    const [row] = await db.select().from(wishlist_items).where(conditions).limit(1);
    return row ?? null;
  }

  async list_by_wishlist(
    wishlist_id: string,
    page: number,
    limit: number,
    filters?: { priority?: string; is_purchased?: boolean },
  ): Promise<{ items: WishlistItem[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof eq>[] = [eq(wishlist_items.wishlist_id, wishlist_id)];

    if (filters?.priority) conditions.push(eq(wishlist_items.priority, filters.priority));
    if (filters?.is_purchased !== undefined) conditions.push(eq(wishlist_items.is_purchased, filters.is_purchased));

    const where = and(...conditions);

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(wishlist_items)
        .where(where)
        .orderBy(asc(wishlist_items.sort_order), desc(wishlist_items.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(wishlist_items).where(where),
    ]);
    return { items, total: Number(total) };
  }

  async list_by_wishlist_all(wishlist_id: string): Promise<WishlistItem[]> {
    return db
      .select()
      .from(wishlist_items)
      .where(eq(wishlist_items.wishlist_id, wishlist_id))
      .orderBy(asc(wishlist_items.sort_order), desc(wishlist_items.created_at));
  }

  async create(data: typeof wishlist_items.$inferInsert): Promise<void> {
    await db.insert(wishlist_items).values(data);
  }

  async update(id: string, data: Partial<typeof wishlist_items.$inferInsert>): Promise<void> {
    await db.update(wishlist_items).set(data).where(eq(wishlist_items.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(wishlist_items).where(eq(wishlist_items.id, id));
  }

  async delete_by_wishlist(wishlist_id: string): Promise<void> {
    await db.delete(wishlist_items).where(eq(wishlist_items.wishlist_id, wishlist_id));
  }

  async count_by_wishlist(wishlist_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(wishlist_items)
      .where(eq(wishlist_items.wishlist_id, wishlist_id));
    return Number(row.total);
  }

  async mark_as_purchased(
    id: string,
    order_id: string,
    purchased_at: string,
  ): Promise<void> {
    await db
      .update(wishlist_items)
      .set({
        is_purchased: true,
        purchased_in_order_id: order_id,
        purchased_at,
      })
      .where(eq(wishlist_items.id, id));
  }

  async update_prices(id: string, current_price: string): Promise<void> {
    const item = await this.find_by_id(id);
    if (!item) return;

    const history = (item.price_history as Array<{ price: string; date: string }>) ?? [];
    const updated_history = [
      ...history,
      { price: current_price, date: new Date().toISOString() },
    ].slice(-50);

    await db
      .update(wishlist_items)
      .set({ current_price: current_price, price_history: updated_history as any })
      .where(eq(wishlist_items.id, id));
  }

  async get_total_saved_products(): Promise<number> {
    const [row] = await db.select({ total: count() }).from(wishlist_items);
    return Number(row.total);
  }

  async get_purchased_count(): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(wishlist_items)
      .where(eq(wishlist_items.is_purchased, true));
    return Number(row.total);
  }

  async get_customer_purchased_count(customer_id: string): Promise<number> {
    const result = await db
      .select({ total: count() })
      .from(wishlist_items)
      .innerJoin(
        wishlists as any,
        eq(wishlist_items.wishlist_id, wishlists.id),
      )
      .where(and(
        eq(wishlists.customer_id, customer_id),
        eq(wishlist_items.is_purchased, true),
      ));
    const row = result[0];
    return Number(row?.total ?? 0);
  }

  async get_total_saved_by_customer(customer_id: string): Promise<number> {
    const result = await db
      .select({ total: count() })
      .from(wishlist_items)
      .innerJoin(
        wishlists as any,
        eq(wishlist_items.wishlist_id, wishlists.id),
      )
      .where(eq(wishlists.customer_id, customer_id));
    const row = result[0];
    return Number(row?.total ?? 0);
  }
}

export const wishlist_item_repository = new WishlistItemRepository();
