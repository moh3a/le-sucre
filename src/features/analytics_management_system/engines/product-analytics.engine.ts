import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
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
};
