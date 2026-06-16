import "server-only";

import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/features/order_management_system/orders/schema";
import { return_requests, type NewReturnRequest } from "../schema";

export class ReturnRepository {
  async create(input: NewReturnRequest): Promise<string> {
    const [created] = await db.insert(return_requests).values(input).$returningId();
    return created.id;
  }

  async find_by_id(id: string) {
    return await db
      .select()
      .from(return_requests)
      .where(eq(return_requests.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_by_user_id(user_id: string) {
    const user_orders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.user_id, user_id));
    if (user_orders.length === 0) return [];
    const order_ids = user_orders.map((o) => o.id);
    return db
      .select()
      .from(return_requests)
      .where(inArray(return_requests.order_id, order_ids))
      .orderBy(desc(return_requests.created_at));
  }

  async find_by_order(order_id: string) {
    return await db
      .select()
      .from(return_requests)
      .where(eq(return_requests.order_id, order_id))
      .orderBy(desc(return_requests.created_at));
  }

  async find_pending_by_order(order_id: string) {
    return await db
      .select()
      .from(return_requests)
      .where(
        and(
          eq(return_requests.order_id, order_id),
          eq(return_requests.status, "pending"),
        ),
      )
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async update_status(
    id: string,
    status: string,
    patch?: Partial<NewReturnRequest>,
  ) {
    return await db
      .update(return_requests)
      .set({ status, ...(patch ?? {}) })
      .where(eq(return_requests.id, id));
  }

  async admin_list(page: number, limit: number, status?: string, type?: string) {
    const offset = (page - 1) * limit;
    const conditions = [];
    if (status) conditions.push(eq(return_requests.status, status));
    if (type) conditions.push(eq(return_requests.type, type));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(return_requests)
        .where(where)
        .orderBy(desc(return_requests.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(return_requests).where(where),
    ]);

    const total_records = Number(total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.ceil(total_records / limit) || 1,
        has_more: page < Math.ceil(total_records / limit),
      },
    };
  }
}

export const return_repository = new ReturnRepository();
