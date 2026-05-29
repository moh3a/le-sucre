import "server-only";
import { and, asc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_daily_metrics } from "../schema";

export const sales_analytics_engine = {
  async revenue_series(from: string, to: string) {
    return db
      .select({
        day_key: analytics_daily_metrics.day_key,
        revenue: analytics_daily_metrics.revenue,
        orders_count: analytics_daily_metrics.orders_count,
        conversion_rate: analytics_daily_metrics.conversion_rate,
      })
      .from(analytics_daily_metrics)
      .where(
        and(gte(analytics_daily_metrics.day_key, from), lte(analytics_daily_metrics.day_key, to)),
      )
      .orderBy(asc(analytics_daily_metrics.day_key));
  },

  async totals(from: string, to: string) {
    const [row] = await db
      .select({
        revenue: sql<string>`COALESCE(SUM(${analytics_daily_metrics.revenue}), 0)`,
        orders: sql<number>`COALESCE(SUM(${analytics_daily_metrics.orders_count}), 0)`.mapWith(
          Number,
        ),
        abandoned_carts:
          sql<number>`COALESCE(SUM(${analytics_daily_metrics.abandoned_carts}), 0)`.mapWith(Number),
        avg_conversion: sql<number>`AVG(${analytics_daily_metrics.conversion_rate})`.mapWith(
          Number,
        ),
      })
      .from(analytics_daily_metrics)
      .where(
        and(gte(analytics_daily_metrics.day_key, from), lte(analytics_daily_metrics.day_key, to)),
      );
    return row;
  },
};
