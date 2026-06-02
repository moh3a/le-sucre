import "server-only";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { orders } from "../../orders/schema";

export class CustomerRepository {
  async list(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        user_id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        created_at: users.created_at,
        total_orders: sql<number>`COUNT(${orders.id})`.mapWith(Number),
        total_spent: sql<string>`COALESCE(SUM(CASE WHEN ${orders.payment_status} = 'paid' THEN ${orders.grand_total} ELSE 0 END), 0)`,
        last_order_at: sql<string | null>`MAX(${orders.placed_at})`,
      })
      .from(users)
      .leftJoin(orders, eq(orders.user_id, users.id))
      .groupBy(users.id, users.name, users.email, users.image, users.created_at)
      .orderBy(desc(sql`MAX(${orders.placed_at})`))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(users);
    const total_records = Number(total ?? 0);

    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / limit)),
        has_more: page * limit < total_records,
      },
    };
  }

  async find_by_id(user_id: string) {
    const [user] = await db
      .select({
        user_id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        created_at: users.created_at,
        total_orders: sql<number>`COUNT(${orders.id})`.mapWith(Number),
        total_spent: sql<string>`COALESCE(SUM(CASE WHEN ${orders.payment_status} = 'paid' THEN ${orders.grand_total} ELSE 0 END), 0)`,
        last_order_at: sql<string | null>`MAX(${orders.placed_at})`,
      })
      .from(users)
      .leftJoin(orders, eq(orders.user_id, users.id))
      .where(eq(users.id, user_id))
      .groupBy(users.id, users.name, users.email, users.image, users.created_at)
      .limit(1);

    return user ?? null;
  }

  async stats() {
    const [row] = await db
      .select({
        total_customers: count(),
        total_revenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.payment_status} = 'paid' THEN ${orders.grand_total} ELSE 0 END), 0)`,
        avg_order_value: sql<string>`COALESCE(AVG(CASE WHEN ${orders.payment_status} = 'paid' THEN ${orders.grand_total} END), 0)`,
      })
      .from(users)
      .leftJoin(orders, eq(orders.user_id, users.id));

    return row;
  }
}

export const customer_repository = new CustomerRepository();
