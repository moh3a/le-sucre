import "server-only";

import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { format } from "date-fns";

import { alias } from "drizzle-orm/mysql-core";
import { db, type DbClient } from "@/lib/db";
import { orders, order_items, order_adjustments, order_status_events } from "../schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

type Tx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

export class OrderRepository {
  async admin_list_by_product(product_id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .selectDistinct({
          order: orders,
          customer_name: users.name,
        })
        .from(orders)
        .innerJoin(order_items, eq(order_items.order_id, orders.id))
        .leftJoin(users, eq(users.id, orders.user_id))
        .where(and(eq(order_items.product_id, product_id), isNull(orders.deleted_at)))
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(DISTINCT ${orders.id})` })
        .from(orders)
        .innerJoin(order_items, eq(order_items.order_id, orders.id))
        .where(and(eq(order_items.product_id, product_id), isNull(orders.deleted_at))),
    ]);

    const total_records = Number(total);
    return {
      items: items.map((item) => {
        const addr = item.order.shipping_address as Record<string, unknown>;
        const fallbackName = typeof addr?.full_name === "string" ? addr.full_name : "";
        return {
          ...item.order,
          customer_name: item.customer_name || fallbackName || item.order.guest_phone || "Client",
        };
      }),
      meta: {
        total_pages: Math.ceil(total_records / limit),
        total_records,
      },
    };
  }

  async find_by_id(id: string) {
    return await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), isNull(orders.deleted_at)))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_any_by_id(id: string) {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_by_order_number(order_number: string) {
    return await db
      .select()
      .from(orders)
      .where(and(eq(orders.order_number, order_number), isNull(orders.deleted_at)))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_by_idempotency(idempotency_key: string, tx?: Tx) {
    const client = tx ?? db;
    return await client
      .select()
      .from(orders)
      .where(and(eq(orders.idempotency_key, idempotency_key), isNull(orders.deleted_at)))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async create_order(input: typeof orders.$inferInsert, tx?: Tx) {
    const client = tx ?? db;
    const [created] = await client.insert(orders).values(input).$returningId();
    return created.id;
  }

  async insert_items(items: Array<typeof order_items.$inferInsert>, tx?: Tx) {
    if (!items.length) return Promise.resolve();
    const client = tx ?? db;
    return await client.insert(order_items).values(items);
  }

  async insert_adjustments(items: Array<typeof order_adjustments.$inferInsert>, tx?: Tx) {
    if (!items.length) return Promise.resolve();
    const client = tx ?? db;
    return await client.insert(order_adjustments).values(items);
  }

  async insert_status_event(input: typeof order_status_events.$inferInsert, tx?: Tx) {
    const client = tx ?? db;
    return await client.insert(order_status_events).values(input);
  }

  async get_full(order_id: string) {
    const operator_users = alias(users, "operator_users");
    const delivery_users = alias(users, "delivery_users");

    const [row] = await db
      .select({
        order: orders,
        operator_name: operator_users.name,
        operator_email: operator_users.email,
        delivery_name: delivery_users.name,
        delivery_email: delivery_users.email,
      })
      .from(orders)
      .leftJoin(operator_users, eq(operator_users.id, orders.assigned_operator_id))
      .leftJoin(delivery_users, eq(delivery_users.id, orders.assigned_delivery_person_id))
      .where(and(eq(orders.id, order_id), isNull(orders.deleted_at)))
      .limit(1);

    if (!row) return null;

    const actor_users = alias(users, "actor_users");
    const [items, adjustments, status_events_raw] = await Promise.all([
      db.select().from(order_items).where(eq(order_items.order_id, order_id)),
      db.select().from(order_adjustments).where(eq(order_adjustments.order_id, order_id)),
      db
        .select({
          id: order_status_events.id,
          order_id: order_status_events.order_id,
          from_status: order_status_events.from_status,
          to_status: order_status_events.to_status,
          actor_user_id: order_status_events.actor_user_id,
          actor_name: actor_users.name,
          note: order_status_events.note,
          created_at: order_status_events.created_at,
        })
        .from(order_status_events)
        .leftJoin(actor_users, eq(actor_users.id, order_status_events.actor_user_id))
        .where(eq(order_status_events.order_id, order_id))
        .orderBy(desc(order_status_events.created_at)),
    ]);

    return {
      order: {
        ...row.order,
        operator_name: row.operator_name,
        operator_email: row.operator_email,
        delivery_name: row.delivery_name,
        delivery_email: row.delivery_email,
      },
      items,
      adjustments,
      status_events: status_events_raw,
    };
  }

  async find_by_user_id(user_id: string) {
    const order_rows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.user_id, user_id), isNull(orders.deleted_at)))
      .orderBy(desc(orders.placed_at ?? orders.created_at));

    if (!order_rows.length) return [];

    const order_ids = order_rows.map((o) => o.id);
    const item_rows = await db
      .select()
      .from(order_items)
      .where(inArray(order_items.order_id, order_ids));

    const items_by_order = new Map<string, typeof item_rows>();
    for (const item of item_rows) {
      const existing = items_by_order.get(item.order_id) ?? [];
      existing.push(item);
      items_by_order.set(item.order_id, existing);
    }

    return order_rows.map((order) => ({
      ...order,
      items: items_by_order.get(order.id) ?? [],
    }));
  }

  async list_for_customer(user_id: string, page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const where = status
      ? and(eq(orders.user_id, user_id), eq(orders.status, status), isNull(orders.deleted_at))
      : and(eq(orders.user_id, user_id), isNull(orders.deleted_at));

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
    const where = status
      ? and(eq(orders.status, status), isNull(orders.deleted_at))
      : isNull(orders.deleted_at);

    const operator_users = alias(users, "operator_users");
    const delivery_users = alias(users, "delivery_users");

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          order: orders,
          customer_name: users.name,
          customer_email: users.email,
          operator_name: operator_users.name,
          delivery_name: delivery_users.name,
        })
        .from(orders)
        .leftJoin(users, eq(users.id, orders.user_id))
        .leftJoin(operator_users, eq(operator_users.id, orders.assigned_operator_id))
        .leftJoin(delivery_users, eq(delivery_users.id, orders.assigned_delivery_person_id))
        .where(where)
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(orders).where(where),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.ceil(total_records / limit) || 1;

    return {
      items: items.map((i) => ({
        ...i.order,
        customer_name: i.customer_name,
        customer_email: i.customer_email,
        operator_name: i.operator_name,
        delivery_name: i.delivery_name,
      })),
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
    tx?: Tx,
  ) {
    const client = tx ?? db;
    return await client
      .update(orders)
      .set({
        status,
        ...(patch ?? {}),
      })
      .where(eq(orders.id, order_id));
  }

  async update_order_assignment(
    order_id: string,
    patch: { assigned_operator_id?: string | null; assigned_delivery_person_id?: string | null },
  ) {
    return await db.update(orders).set(patch).where(eq(orders.id, order_id));
  }

  async update_notes(order_id: string, notes: string | null) {
    return await db.update(orders).set({ notes }).where(eq(orders.id, order_id));
  }

  async update_order_payment(
    order_id: string,
    patch: { payment_status?: string; payment_provider?: string | null; payment_reference?: string | null },
  ) {
    return await db.update(orders).set(patch).where(eq(orders.id, order_id));
  }

  async find_items_by_order(order_id: string) {
    return await db.select().from(order_items).where(eq(order_items.order_id, order_id));
  }

  async update_shipping_address(order_id: string, address: Record<string, unknown>) {
    return await db.update(orders).set({ shipping_address: address }).where(eq(orders.id, order_id));
  }

  async delete_order(order_id: string) {
    await db
      .update(orders)
      .set({ deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") })
      .where(and(eq(orders.id, order_id), isNull(orders.deleted_at)));
  }

  async restore_order(order_id: string) {
    await db
      .update(orders)
      .set({ deleted_at: null })
      .where(eq(orders.id, order_id));
  }
}

export const order_repository = new OrderRepository();
