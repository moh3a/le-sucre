import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders, order_items, order_adjustments, order_status_events } from "./schema";

export class OrderRepository {
  async admin_list_by_product(product_id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const items = await db
      .selectDistinct({ order: orders })
      .from(orders)
      .innerJoin(order_items, eq(order_items.order_id, orders.id))
      .where(eq(order_items.product_id, product_id))
      .orderBy(desc(orders.created_at))
      .limit(limit)
      .offset(offset);
    return items.map((item) => item.order);
  }
  
  async find_by_id(id: string) {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_by_idempotency(idempotency_key: string) {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.idempotency_key, idempotency_key))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async create_order(input: typeof orders.$inferInsert) {
    const [created] = await db.insert(orders).values(input).$returningId();
    return created.id;
  }

  async insert_items(items: Array<typeof order_items.$inferInsert>) {
    if (!items.length) return Promise.resolve();
    return await db.insert(order_items).values(items);
  }

  async insert_adjustments(items: Array<typeof order_adjustments.$inferInsert>) {
    if (!items.length) return Promise.resolve();
    return await db.insert(order_adjustments).values(items);
  }

  async insert_status_event(input: typeof order_status_events.$inferInsert) {
    return await db.insert(order_status_events).values(input);
  }

  async get_full(order_id: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, order_id)).limit(1);
    if (!order) return null;

    const [items, adjustments, status_events] = await Promise.all([
      db.select().from(order_items).where(eq(order_items.order_id, order_id)),
      db.select().from(order_adjustments).where(eq(order_adjustments.order_id, order_id)),
      db
        .select()
        .from(order_status_events)
        .where(eq(order_status_events.order_id, order_id))
        .orderBy(desc(order_status_events.created_at)),
    ]);

    return { order, items, adjustments, status_events };
  }

  async list_for_customer(user_id: string, page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const where = status
      ? and(eq(orders.user_id, user_id), eq(orders.status, status))
      : eq(orders.user_id, user_id);

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(where)
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(orders).where(where),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.ceil(total_records / limit) || 1;

    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }

  async admin_list(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(orders.status, status) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(where)
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(orders).where(where),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.ceil(total_records / limit) || 1;

    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }

  async update_order_status(
    order_id: string,
    status: string,
    patch?: Partial<typeof orders.$inferInsert>,
  ) {
    return await db
      .update(orders)
      .set({
        status,
        ...(patch ?? {}),
      })
      .where(eq(orders.id, order_id));
  }
}

export const order_repository = new OrderRepository();
