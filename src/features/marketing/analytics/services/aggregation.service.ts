import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { redis } from "@/lib/redis";
import {
  analytics_events,
  analytics_daily_metrics,
  analytics_product_daily,
  analytics_funnel_daily,
  analytics_search_daily,
  analytics_category_daily,
  analytics_brand_daily,
  analytics_customer_cohorts,
} from "../schema";
import { orders, order_items } from "@/features/order_management_system/orders/schema";
import { products } from "@/features/product_information_management/products/schema";
import { invalidate_analytics_cache } from "../helpers/invalidate-analytics-cache.helper";
import { format } from "date-fns";

export class AggregationService {
  async rollup_day(day: string) {
    const [orders_row] = await db
      .select({
        orders_count: sql<number>`COUNT(*)`.mapWith(Number),
        revenue: sql<string>`COALESCE(SUM(${orders.grand_total}), 0)`,
      })
      .from(orders)
      .where(and(eq(orders.payment_status, "paid"), sql`DATE(${orders.placed_at}) = ${day}`));

    const [events_row] = await db
      .select({
        product_views:
          sql<number>`SUM(CASE WHEN event_type='product_view' THEN 1 ELSE 0 END)`.mapWith(Number),
        add_to_cart: sql<number>`SUM(CASE WHEN event_type='add_to_cart' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
        checkout_started:
          sql<number>`SUM(CASE WHEN event_type='checkout_started' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        purchases: sql<number>`SUM(CASE WHEN event_type='purchase' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
        searches: sql<number>`SUM(CASE WHEN event_type='search' THEN 1 ELSE 0 END)`.mapWith(Number),
        abandoned: sql<number>`SUM(CASE WHEN event_type='cart_abandoned' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
      })
      .from(analytics_events)
      .where(eq(analytics_events.day_key, day));

    const [sales_row] = await db
      .select({
        units_sold: sql<number>`COALESCE(SUM(${order_items.quantity}), 0)`.mapWith(Number),
      })
      .from(order_items)
      .innerJoin(orders, eq(orders.id, order_items.order_id))
      .where(
        and(eq(orders.payment_status, "paid"), sql`DATE(${orders.placed_at}) = ${day}`),
      );

    const unique_visitors = await redis.pfcount(`analytics:uv:${day}`);
    const heuristic_abandoned = Math.max(
      0,
      (events_row?.add_to_cart ?? 0) - (orders_row?.orders_count ?? 0),
    );
    const abandoned_carts =
      (events_row?.abandoned ?? 0) > 0 ? events_row.abandoned : heuristic_abandoned;
    const conversion_rate =
      unique_visitors > 0 ? (orders_row?.orders_count ?? 0) / unique_visitors : 0;
    const units_sold = sales_row?.units_sold ?? 0;

    await db
      .insert(analytics_daily_metrics)
      .values({
        id: generate_id(),
        day_key: day,
        orders_count: orders_row?.orders_count ?? 0,
        revenue: String(orders_row?.revenue ?? "0"),
        units_sold,
        unique_visitors,
        product_views: events_row?.product_views ?? 0,
        add_to_cart: events_row?.add_to_cart ?? 0,
        checkout_started: events_row?.checkout_started ?? 0,
        purchases: events_row?.purchases ?? 0,
        abandoned_carts,
        searches: events_row?.searches ?? 0,
        conversion_rate: String(conversion_rate.toFixed(4)),
      })
      .onDuplicateKeyUpdate({
        set: {
          orders_count: orders_row?.orders_count ?? 0,
          revenue: String(orders_row?.revenue ?? "0"),
          units_sold,
          unique_visitors,
          product_views: events_row?.product_views ?? 0,
          add_to_cart: events_row?.add_to_cart ?? 0,
          checkout_started: events_row?.checkout_started ?? 0,
          purchases: events_row?.purchases ?? 0,
          abandoned_carts,
          searches: events_row?.searches ?? 0,
          conversion_rate: String(conversion_rate.toFixed(4)),
          updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        },
      });

    await this.rollup_products(day);
    await this.rollup_funnel(day);
    await this.rollup_search(day);
    await invalidate_analytics_cache();
  }

  private async rollup_products(day: string) {
    const rows = await db
      .select({
        product_id: analytics_events.product_id,
        views: sql<number>`SUM(CASE WHEN event_type='product_view' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
        add_to_cart: sql<number>`SUM(CASE WHEN event_type='add_to_cart' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
        purchases: sql<number>`SUM(CASE WHEN event_type='purchase' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
        clicks: sql<number>`SUM(CASE WHEN event_type='click' THEN 1 ELSE 0 END)`.mapWith(Number),
        recommendation_clicks:
          sql<number>`SUM(CASE WHEN event_type='recommendation_click' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(analytics_events)
      .where(
        and(eq(analytics_events.day_key, day), sql`${analytics_events.product_id} IS NOT NULL`),
      )
      .groupBy(analytics_events.product_id);

    const category_agg = new Map<
      string,
      { views: number; revenue: number; units_sold: number }
    >();
    const brand_agg = new Map<string, { views: number; revenue: number; units_sold: number }>();

    for (const r of rows) {
      if (!r.product_id) continue;
      const [p] = await db
        .select({ category_id: products.category_id, brand_id: products.brand_id })
        .from(products)
        .where(eq(products.id, r.product_id))
        .limit(1);

      const [sales] = await db
        .select({
          units: sql<number>`COALESCE(SUM(${order_items.quantity}), 0)`.mapWith(Number),
          revenue: sql<string>`COALESCE(SUM(${order_items.line_total}), 0)`,
        })
        .from(order_items)
        .innerJoin(orders, eq(orders.id, order_items.order_id))
        .where(
          and(
            eq(order_items.product_id, r.product_id),
            eq(orders.payment_status, "paid"),
            sql`DATE(${orders.placed_at}) = ${day}`,
          ),
        );

      const conversion = r.views ? r.purchases / r.views : 0;
      const revenue = Number(sales?.revenue ?? "0");
      const units = sales?.units ?? 0;

      await db
        .insert(analytics_product_daily)
        .values({
          id: generate_id(),
          day_key: day,
          product_id: r.product_id,
          category_id: p?.category_id ?? null,
          brand_id: p?.brand_id ?? null,
          views: r.views,
          add_to_cart: r.add_to_cart,
          purchases: r.purchases,
          units_sold: units,
          revenue: String(revenue),
          clicks: r.clicks,
          recommendation_clicks: r.recommendation_clicks,
          conversion_rate: String(conversion.toFixed(4)),
        })
        .onDuplicateKeyUpdate({
          set: {
            views: r.views,
            add_to_cart: r.add_to_cart,
            purchases: r.purchases,
            units_sold: units,
            revenue: String(revenue),
            clicks: r.clicks,
            recommendation_clicks: r.recommendation_clicks,
            conversion_rate: String(conversion.toFixed(4)),
            updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
        });

      if (p?.category_id) {
        const prev = category_agg.get(p.category_id) ?? { views: 0, revenue: 0, units_sold: 0 };
        category_agg.set(p.category_id, {
          views: prev.views + r.views,
          revenue: prev.revenue + revenue,
          units_sold: prev.units_sold + units,
        });
      }

      if (p?.brand_id) {
        const prev = brand_agg.get(p.brand_id) ?? { views: 0, revenue: 0, units_sold: 0 };
        brand_agg.set(p.brand_id, {
          views: prev.views + r.views,
          revenue: prev.revenue + revenue,
          units_sold: prev.units_sold + units,
        });
      }
    }

    for (const [category_id, agg] of category_agg) {
      await this.upsert_category_daily(day, category_id, agg);
    }
    for (const [brand_id, agg] of brand_agg) {
      await this.upsert_brand_daily(day, brand_id, agg);
    }
  }

  private async upsert_category_daily(
    day: string,
    category_id: string,
    agg: { views: number; revenue: number; units_sold: number },
  ) {
    await db
      .insert(analytics_category_daily)
      .values({
        id: generate_id(),
        day_key: day,
        category_id,
        views: agg.views,
        revenue: String(agg.revenue),
        units_sold: agg.units_sold,
      })
      .onDuplicateKeyUpdate({
        set: {
          views: agg.views,
          revenue: String(agg.revenue),
          units_sold: agg.units_sold,
          updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        },
      });
  }

  private async upsert_brand_daily(
    day: string,
    brand_id: string,
    agg: { views: number; revenue: number; units_sold: number },
  ) {
    await db
      .insert(analytics_brand_daily)
      .values({
        id: generate_id(),
        day_key: day,
        brand_id,
        views: agg.views,
        revenue: String(agg.revenue),
        units_sold: agg.units_sold,
      })
      .onDuplicateKeyUpdate({
        set: {
          views: agg.views,
          revenue: String(agg.revenue),
          units_sold: agg.units_sold,
          updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        },
      });
  }

  private async rollup_funnel(day: string) {
    for (const step of ["view", "add_to_cart", "checkout", "purchase"]) {
      const sessions = Number(
        (await redis.hget(`analytics:funnel:${step}:${day}`, "sessions")) ?? 0,
      );
      await db
        .insert(analytics_funnel_daily)
        .values({ id: generate_id(), day_key: day, step, sessions })
        .onDuplicateKeyUpdate({
          set: { sessions, updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") },
        });
    }
  }

  private async rollup_search(day: string) {
    const search_rows = await db
      .select({
        query: analytics_events.search_query,
        count: sql<number>`COUNT(*)`.mapWith(Number),
        zero_result: sql<number>`SUM(CASE WHEN CAST(JSON_EXTRACT(${analytics_events.metadata}, '$.result_count') AS SIGNED) = 0 THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
      })
      .from(analytics_events)
      .where(and(eq(analytics_events.day_key, day), eq(analytics_events.event_type, "search")))
      .groupBy(analytics_events.search_query);

    const click_rows = await db
      .select({
        query: analytics_events.search_query,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(analytics_events)
      .where(and(eq(analytics_events.day_key, day), eq(analytics_events.event_type, "click")))
      .groupBy(analytics_events.search_query);

    const click_count_by_query = new Map<string, number>();
    for (const r of click_rows) {
      if (!r.query) continue;
      const normalized = r.query.trim().toLowerCase().slice(0, 255);
      click_count_by_query.set(normalized, (click_count_by_query.get(normalized) ?? 0) + r.count);
    }

    for (const r of search_rows) {
      if (!r.query) continue;
      const normalized = r.query.trim().toLowerCase().slice(0, 255);
      await db
        .insert(analytics_search_daily)
        .values({
          id: generate_id(),
          day_key: day,
          query_normalized: normalized,
          search_count: r.count,
          zero_result_count: r.zero_result,
          click_through_count: click_count_by_query.get(normalized) ?? 0,
        })
        .onDuplicateKeyUpdate({
          set: {
            search_count: r.count,
            zero_result_count: r.zero_result,
            click_through_count: click_count_by_query.get(normalized) ?? 0,
            updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
        });
    }
  }

  /** Cohort retention: for every customer cohort month, count active customers
   * per period offset and their revenue. Idempotent (absolute upsert). */
  async rollup_cohorts() {
    const [result_rows] = await db.execute(
      sql`SELECT
            cohorts.cohort_month AS cohort_month,
            PERIOD_DIFF(
              DATE_FORMAT(o.placed_at, '%Y%m'),
              REPLACE(cohorts.cohort_month, '-', '')
            ) AS period_offset,
            COUNT(DISTINCT o.user_id) AS customers_count,
            COALESCE(SUM(o.grand_total), 0) AS revenue
          FROM (
            SELECT user_id, MIN(DATE_FORMAT(placed_at, '%Y-%m')) AS cohort_month
            FROM orders
            WHERE payment_status = 'paid' AND user_id IS NOT NULL
            GROUP BY user_id
          ) cohorts
          JOIN orders o
            ON o.user_id = cohorts.user_id
           AND o.payment_status = 'paid'
          GROUP BY cohorts.cohort_month, period_offset`,
    );

    const cohort_sizes = new Map<string, number>();
    const parsed: Array<{
      cohort_month: string;
      period_offset: number;
      customers_count: number;
      revenue: string;
    }> = (result_rows as unknown as Array<Record<string, unknown>>).map((r) => {
      const cohort_month = String(r.cohort_month);
      const period_offset = Number(r.period_offset);
      const customers_count = Number(r.customers_count);
      if (period_offset === 0) cohort_sizes.set(cohort_month, customers_count);
      return {
        cohort_month,
        period_offset,
        customers_count,
        revenue: String(r.revenue ?? "0"),
      };
    });

    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    for (const row of parsed) {
      const size = cohort_sizes.get(row.cohort_month) ?? row.customers_count;
      const repeat_rate =
        row.period_offset === 0 || size === 0 ? 0 : row.customers_count / size;
      await db
        .insert(analytics_customer_cohorts)
        .values({
          id: generate_id(),
          cohort_month: row.cohort_month,
          period_offset: row.period_offset,
          customers_count: row.customers_count,
          repeat_purchase_rate: String(repeat_rate.toFixed(4)),
          revenue: row.revenue,
        })
        .onDuplicateKeyUpdate({
          set: {
            customers_count: row.customers_count,
            repeat_purchase_rate: String(repeat_rate.toFixed(4)),
            revenue: row.revenue,
            updated_at: now,
          },
        });
    }
  }
}

export const aggregation_service = new AggregationService();
