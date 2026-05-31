import "server-only";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "../schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

function month_bounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  return { start, end };
} 

export class OrderAdminRepository {
  async stats() {
    const { start, end } = month_bounds();

    const [monthly] = await db
      .select({
        revenue: sql<string>`COALESCE(SUM(${orders.grand_total}), 0)`,
        orders: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.payment_status, "paid"),
          gte(orders.placed_at, start),
          lte(orders.placed_at, end),
        ),
      );

    const status_counts = await db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.status);

    const map = Object.fromEntries(status_counts.map((s) => [s.status, Number(s.count)]));

    const revenue = Number(monthly?.revenue ?? 0);
    const monthly_orders = Number(monthly?.orders ?? 0);

    return {
      monthly_revenue: revenue.toFixed(2),
      monthly_orders,
      average_order_value: monthly_orders ? (revenue / monthly_orders).toFixed(2) : "0.00",
      active_orders: (map.paid ?? 0) + (map.processing ?? 0),
      pending_orders: map.pending_payment ?? 0,
      completed_orders: map.fulfilled ?? 0,
      cancelled_orders: map.cancelled ?? 0,
    };
  }

  async revenue_series(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    return db
      .select({
        day_key: sql<string>`DATE(${orders.placed_at})`,
        revenue: sql<string>`COALESCE(SUM(${orders.grand_total}), 0)`,
        orders_count: count(),
      })
      .from(orders)
      .where(and(eq(orders.payment_status, "paid"), gte(orders.placed_at, since)))
      .groupBy(sql`DATE(${orders.placed_at})`)
      .orderBy(sql`DATE(${orders.placed_at})`);
  }

  async status_distribution() {
    return db.select({ status: orders.status, count: count() }).from(orders).groupBy(orders.status);
  }

  async list_enriched(input: {
    page: number;
    limit: number;
    status?: string;
    payment_status?: string;
    fulfillment_status?: string;
    from?: string;
    to?: string;
  }) {
    const offset = (input.page - 1) * input.limit;
    const clauses = [];
    if (input.status) clauses.push(eq(orders.status, input.status));
    if (input.payment_status) clauses.push(eq(orders.payment_status, input.payment_status));
    if (input.fulfillment_status)
      clauses.push(eq(orders.fulfillment_status, input.fulfillment_status));
    if (input.from) clauses.push(gte(orders.created_at, input.from));
    if (input.to) clauses.push(lte(orders.created_at, input.to));
    const where = clauses.length ? and(...clauses) : undefined;

    const items = await db
      .select({
        id: orders.id,
        order_number: orders.order_number,
        status: orders.status,
        payment_status: orders.payment_status,
        fulfillment_status: orders.fulfillment_status,
        grand_total: orders.grand_total,
        guest_email: orders.guest_email,
        created_at: orders.created_at,
        customer_name: users.name,
        customer_email: users.email,
        customer_phone: sql<
          string | null
        >`JSON_UNQUOTE(JSON_EXTRACT(${orders.shipping_address}, '$.phone'))`,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.user_id))
      .where(where)
      .orderBy(desc(orders.created_at))
      .limit(input.limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(orders).where(where);
    const total_records = Number(total ?? 0);

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
}

export const order_admin_repository = new OrderAdminRepository();
