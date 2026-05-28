import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { carts, cart_items } from "../schema";

export class CartRepository {
  async find_by_id(id: string) {
    return await db
      .select()
      .from(carts)
      .where(eq(carts.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_active_by_user(user_id: string) {
    return await db
      .select()
      .from(carts)
      .where(and(eq(carts.user_id, user_id), eq(carts.status, "active")))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async create(input: { user_id: string | null; guest_token: string | null; currency?: string }) {
    const [created] = await db
      .insert(carts)
      .values({
        user_id: input.user_id,
        guest_token: input.guest_token,
        currency: input.currency ?? "DZD",
        status: "active",
      })
      .$returningId();

    return this.find_by_id(created.id);
  }

  async list_items(cart_id: string) {
    return await db.select().from(cart_items).where(eq(cart_items.cart_id, cart_id));
  }

  async find_item(cart_id: string, sku_id: string) {
    return await db
      .select()
      .from(cart_items)
      .where(and(eq(cart_items.cart_id, cart_id), eq(cart_items.sku_id, sku_id)))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_item_by_id(id: string, cart_id: string) {
    return await db
      .select()
      .from(cart_items)
      .where(and(eq(cart_items.id, id), eq(cart_items.cart_id, cart_id)))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async insert_item(input: typeof cart_items.$inferInsert) {
    return await db.insert(cart_items).values(input);
  }

  async update_item(id: string, data: Partial<typeof cart_items.$inferInsert>) {
    return await db.update(cart_items).set(data).where(eq(cart_items.id, id));
  }

  async delete_item(id: string) {
    return await db.delete(cart_items).where(eq(cart_items.id, id));
  }

  async clear_cart(cart_id: string) {
    await db.delete(cart_items).where(eq(cart_items.cart_id, cart_id));
  }

  async mark_converted(cart_id: string) {
    return await db.update(carts).set({ status: "converted" }).where(eq(carts.id, cart_id));
  }
}

export const cart_repository = new CartRepository();
