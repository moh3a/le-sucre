import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { alias } from "drizzle-orm/mysql-core";
import { db } from "@/lib/db";
import { orders, order_items, order_adjustments, order_status_events } from "../schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

export class OrderRepository {
  async admin_list_by_product(product_id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const items = await db
      .selectDistinct({
        order: orders,
        customer_name: users.name,
      })
      .from(orders)
      .innerJoin(order_items, eq(order_items.order_id, orders.id))
      .leftJoin(users, eq(users.id, orders.user_id))
      .where(eq(order_items.product_id, product_id))
      .orderBy(desc(orders.created_at))
      .limit(limit)
      .offset(offset);

    return {
      items: items.map((item) => {
        const addr = item.order.shipping_address as Record<string, unknown>;
        const fallbackName = typeof addr?.full_name === "string" ? addr.full_name : "";
        return {
          ...item.order,
          customer_name: item.customer_name || fallbackName || item.order.guest_phone || "Client",
        };
      }),
      meta: { total_pages: Math.ceil(items.length / limit), total_records: items.length },
    };
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
      .where(eq(orders.id, order_id))
      .limit(1);

    if (!row) return null;

    const [items, adjustments, status_events] = await Promise.all([
      db.select().from(order_items).where(eq(order_items.order_id, order_id)),
      db.select().from(order_adjustments).where(eq(order_adjustments.order_id, order_id)),
      db
        .select()
        .from(order_status_events)
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
      status_events,
    };
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
  ) {
    return await db
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
}

export const order_repository = new OrderRepository();
