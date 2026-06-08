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
      })
      .from(analytics_events)
      .where(eq(analytics_events.day_key, day));

    const unique_visitors = await redis.pfcount(`analytics:uv:${day}`);
    const abandoned_carts = Math.max(
      0,
      (events_row?.add_to_cart ?? 0) - (orders_row?.orders_count ?? 0),
    );
    const conversion_rate =
      unique_visitors > 0 ? (orders_row?.orders_count ?? 0) / unique_visitors : 0;

    await db
      .insert(analytics_daily_metrics)
      .values({
        id: generate_id(),
        day_key: day,
        orders_count: orders_row?.orders_count ?? 0,
        revenue: String(orders_row?.revenue ?? "0"),
        units_sold: 0,
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
          units_sold: sales?.units ?? 0,
          revenue: String(sales?.revenue ?? "0"),
          clicks: r.clicks,
          recommendation_clicks: r.recommendation_clicks,
          conversion_rate: String(conversion.toFixed(4)),
        })
        .onDuplicateKeyUpdate({
          set: {
            views: r.views,
            add_to_cart: r.add_to_cart,
            purchases: r.purchases,
            units_sold: sales?.units ?? 0,
            revenue: String(sales?.revenue ?? "0"),
            clicks: r.clicks,
            recommendation_clicks: r.recommendation_clicks,
            conversion_rate: String(conversion.toFixed(4)),
            updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
        });

      if (p?.category_id) {
        await db
          .insert(analytics_category_daily)
          .values({
            id: generate_id(),
            day_key: day,
            category_id: p.category_id,
            views: r.views,
            revenue: String(sales?.revenue ?? "0"),
            units_sold: sales?.units ?? 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              views: sql`${analytics_category_daily.views} + ${r.views}`,
              revenue: sql`${analytics_category_daily.revenue} + ${sales?.revenue ?? 0}`,
              units_sold: sql`${analytics_category_daily.units_sold} + ${sales?.units ?? 0}`,
            },
          });
      }

      if (p?.brand_id) {
        await db
          .insert(analytics_brand_daily)
          .values({
            id: generate_id(),
            day_key: day,
            brand_id: p.brand_id,
            views: r.views,
            revenue: String(sales?.revenue ?? "0"),
            units_sold: sales?.units ?? 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              views: sql`${analytics_brand_daily.views} + ${r.views}`,
              revenue: sql`${analytics_brand_daily.revenue} + ${sales?.revenue ?? 0}`,
              units_sold: sql`${analytics_brand_daily.units_sold} + ${sales?.units ?? 0}`,
            },
          });
      }
    }
  }

  private async rollup_funnel(day: string) {
    for (const step of ["view", "add_to_cart", "checkout", "purchase"]) {
      const sessions = Number(
        (await redis.hget(`analytics:funnel:${step}:${day}`, "sessions")) ?? 0,
      );
      await db
        .insert(analytics_funnel_daily)
        .values({ id: generate_id(), day_key: day, step, sessions })
        .onDuplicateKeyUpdate({ set: { sessions, updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") } });
    }
  }

  private async rollup_search(day: string) {
    const rows = await db
      .select({
        query: analytics_events.search_query,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(analytics_events)
      .where(and(eq(analytics_events.day_key, day), eq(analytics_events.event_type, "search")))
      .groupBy(analytics_events.search_query);

    for (const r of rows) {
      if (!r.query) continue;
      const normalized = r.query.trim().toLowerCase().slice(0, 255);
      await db
        .insert(analytics_search_daily)
        .values({
          id: generate_id(),
          day_key: day,
          query_normalized: normalized,
          search_count: r.count,
        })
        .onDuplicateKeyUpdate({
          set: {
            search_count: r.count,
            updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
        });
    }
  }
}

export const aggregation_service = new AggregationService();
