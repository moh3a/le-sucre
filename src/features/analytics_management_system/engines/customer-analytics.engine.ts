import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/features/order_management_system/orders/schema";
import { analytics_customer_cohorts } from "../schema";

export const customer_analytics_engine = {
  async repeat_purchase_rate(days = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoff_iso = cutoff.toISOString();

    const rows = await db
      .select({
        user_id: orders.user_id,
        order_count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.payment_status, "paid"),
          gte(orders.placed_at, cutoff_iso),
          sql`${orders.user_id} IS NOT NULL`,
        ),
      )
      .groupBy(orders.user_id);

    const total = rows.length;
    const repeat = rows.filter((r) => r.order_count > 1).length;
    return {
      customers: total,
      repeat_customers: repeat,
      repeat_rate: total ? repeat / total : 0,
    };
  },

  async cohorts(limit = 12) {
    return db
      .select()
      .from(analytics_customer_cohorts)
      .orderBy(analytics_customer_cohorts.cohort_month)
      .limit(limit);
  },
};
