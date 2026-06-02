import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_product_daily } from "../schema";
import {
  product_translations,
  products,
} from "@/features/product_information_management/products/schema";

export const product_analytics_engine = {
  async best_sellers(from: string, to: string, limit: number) {
    return db
      .select({
        product_id: analytics_product_daily.product_id,
        name: product_translations.name,
        units_sold: sql<number>`SUM(${analytics_product_daily.units_sold})`.mapWith(Number),
        revenue: sql<string>`SUM(${analytics_product_daily.revenue})`,
        views: sql<number>`SUM(${analytics_product_daily.views})`.mapWith(Number),
      })
      .from(analytics_product_daily)
      .innerJoin(products, eq(products.id, analytics_product_daily.product_id))
      .innerJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, "fr"),
        ),
      )
      .where(
        and(gte(analytics_product_daily.day_key, from), lte(analytics_product_daily.day_key, to)),
      )
      .groupBy(analytics_product_daily.product_id, product_translations.name)
      .orderBy(desc(sql`SUM(${analytics_product_daily.revenue})`))
      .limit(limit);
  },

  async most_viewed(from: string, to: string, limit: number) {
    return db
      .select({
        product_id: analytics_product_daily.product_id,
        views: sql<number>`SUM(${analytics_product_daily.views})`.mapWith(Number),
        purchases: sql<number>`SUM(${analytics_product_daily.purchases})`.mapWith(Number),
        conversion_rate: sql<number>`
          CASE WHEN SUM(${analytics_product_daily.views}) = 0 THEN 0
          ELSE SUM(${analytics_product_daily.purchases}) / SUM(${analytics_product_daily.views})
          END`.mapWith(Number),
      })
      .from(analytics_product_daily)
      .where(
        and(gte(analytics_product_daily.day_key, from), lte(analytics_product_daily.day_key, to)),
      )
      .groupBy(analytics_product_daily.product_id)
      .orderBy(desc(sql`SUM(${analytics_product_daily.views})`))
      .limit(limit);
  },

  /** Per-product daily timeseries for a specific product detail view. */
  async daily_series(product_id: string, from: string, to: string) {
    return db
      .select({
        day_key: analytics_product_daily.day_key,
        views: analytics_product_daily.views,
        add_to_cart: analytics_product_daily.add_to_cart,
        purchases: analytics_product_daily.purchases,
        units_sold: analytics_product_daily.units_sold,
        revenue: analytics_product_daily.revenue,
        recommendation_clicks: analytics_product_daily.recommendation_clicks,
        conversion_rate: analytics_product_daily.conversion_rate,
      })
      .from(analytics_product_daily)
      .where(
        and(
          eq(analytics_product_daily.product_id, product_id),
          gte(analytics_product_daily.day_key, from),
          lte(analytics_product_daily.day_key, to),
        ),
      )
      .orderBy(asc(analytics_product_daily.day_key));
  },

  /** Aggregated totals for a specific product over a date range. */
  async product_totals(product_id: string, from: string, to: string) {
    const [row] = await db
      .select({
        views: sql<number>`COALESCE(SUM(${analytics_product_daily.views}), 0)`.mapWith(Number),
        add_to_cart: sql<number>`COALESCE(SUM(${analytics_product_daily.add_to_cart}), 0)`.mapWith(
          Number,
        ),
        purchases: sql<number>`COALESCE(SUM(${analytics_product_daily.purchases}), 0)`.mapWith(
          Number,
        ),
        units_sold: sql<number>`COALESCE(SUM(${analytics_product_daily.units_sold}), 0)`.mapWith(
          Number,
        ),
        revenue: sql<string>`COALESCE(SUM(${analytics_product_daily.revenue}), 0)`,
        recommendation_clicks:
          sql<number>`COALESCE(SUM(${analytics_product_daily.recommendation_clicks}), 0)`.mapWith(
            Number,
          ),
        avg_conversion: sql<number>`AVG(${analytics_product_daily.conversion_rate})`.mapWith(
          Number,
        ),
      })
      .from(analytics_product_daily)
      .where(
        and(
          eq(analytics_product_daily.product_id, product_id),
          gte(analytics_product_daily.day_key, from),
          lte(analytics_product_daily.day_key, to),
        ),
      );
    return row;
  },
};
