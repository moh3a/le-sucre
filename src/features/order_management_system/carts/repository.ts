import "server-only";

import { and, count, desc, eq, lte, or, like, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";

import { db } from "@/lib/db";
import { carts, cart_items } from "../schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

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

  async list_admin(input: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const offset = (input.page - 1) * input.limit;
    const countClauses = [];
    if (input.status) {
      if (input.status === "abandoned") {
        const threshold = format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm:ss");
        countClauses.push(eq(carts.status, "active"));
        countClauses.push(lte(carts.updated_at, threshold));
      } else {
        countClauses.push(eq(carts.status, input.status));
      }
    }
    if (input.search) {
      countClauses.push(
        or(
          like(carts.id, `%${input.search}%`),
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`),
          like(carts.guest_token, `%${input.search}%`),
        )
      );
    }
    const where = countClauses.length ? and(...countClauses) : undefined;

    const totalRes = await db
      .select({ total: count(carts.id) })
      .from(carts)
      .leftJoin(users, eq(users.id, carts.user_id))
      .where(where);
    const total_records = Number(totalRes[0]?.total ?? 0);

    const items = await db
      .select({
        id: carts.id,
        user_id: carts.user_id,
        guest_token: carts.guest_token,
        status: carts.status,
        currency: carts.currency,
        created_at: carts.created_at,
        updated_at: carts.updated_at,
        customer_name: users.name,
        customer_email: users.email,
        item_count: sql<number>`COALESCE(SUM(${cart_items.quantity}), 0)`.mapWith(Number),
        total_price: sql<string>`COALESCE(SUM(${cart_items.unit_price} * ${cart_items.quantity}), '0.00')`,
      })
      .from(carts)
      .leftJoin(users, eq(users.id, carts.user_id))
      .leftJoin(cart_items, eq(cart_items.cart_id, carts.id))
      .where(where)
      .groupBy(carts.id, users.id)
      .orderBy(desc(carts.updated_at))
      .limit(input.limit)
      .offset(offset);

    return {
      items,
      meta: {
        page: input.page,
        limit: input.limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / input.limit)),
        has_more: input.page * input.limit < total_records,
      },
    };
  }

  async stats_admin() {
    const threshold = format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm:ss");

    const counts = await db
      .select({
        status: carts.status,
        total: count(carts.id),
      })
      .from(carts)
      .groupBy(carts.status);

    const map = Object.fromEntries(counts.map((c) => [c.status, Number(c.total)]));

    const [abandonedRes] = await db
      .select({
        total: count(sql`distinct ${carts.id}`),
      })
      .from(carts)
      .innerJoin(cart_items, eq(cart_items.cart_id, carts.id))
      .where(
        and(
          eq(carts.status, "active"),
          lte(carts.updated_at, threshold),
        )
      );

    return {
      total: counts.reduce((acc, c) => acc + Number(c.total), 0),
      active: map.active ?? 0,
      converted: map.converted ?? 0,
      merged: map.merged ?? 0,
      abandoned: Number(abandonedRes?.total ?? 0),
    };
  }
}

export const cart_repository = new CartRepository();
