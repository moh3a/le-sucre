import "server-only";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_category_daily, analytics_brand_daily, analytics_search_daily } from "../schema";

export const reporting_queries = {
  top_categories(from: string, to: string, limit: number) {
    return db
      .select({
        category_id: analytics_category_daily.category_id,
        revenue: sql<string>`SUM(${analytics_category_daily.revenue})`,
        views: sql<number>`SUM(${analytics_category_daily.views})`.mapWith(Number),
      })
      .from(analytics_category_daily)
      .where(
        and(gte(analytics_category_daily.day_key, from), lte(analytics_category_daily.day_key, to)),
      )
      .groupBy(analytics_category_daily.category_id)
      .orderBy(desc(sql`SUM(${analytics_category_daily.revenue})`))
      .limit(limit);
  },

  top_brands(from: string, to: string, limit: number) {
    return db
      .select({
        brand_id: analytics_brand_daily.brand_id,
        revenue: sql<string>`SUM(${analytics_brand_daily.revenue})`,
        views: sql<number>`SUM(${analytics_brand_daily.views})`.mapWith(Number),
      })
      .from(analytics_brand_daily)
      .where(and(gte(analytics_brand_daily.day_key, from), lte(analytics_brand_daily.day_key, to)))
      .groupBy(analytics_brand_daily.brand_id)
      .orderBy(desc(sql`SUM(${analytics_brand_daily.revenue})`))
      .limit(limit);
  },

  top_searches(from: string, to: string, limit: number) {
    return db
      .select({
        query: analytics_search_daily.query_normalized,
        count: sql<number>`SUM(${analytics_search_daily.search_count})`.mapWith(Number),
      })
      .from(analytics_search_daily)
      .where(
        and(gte(analytics_search_daily.day_key, from), lte(analytics_search_daily.day_key, to)),
      )
      .groupBy(analytics_search_daily.query_normalized)
      .orderBy(desc(sql`SUM(${analytics_search_daily.search_count})`))
      .limit(limit);
  },
};
