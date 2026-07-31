import "server-only";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  wishlists,
  wishlist_items,
  wishlist_analytics_events,
} from "../db/schema";

export class WishlistAnalyticsRepository {
  async record_event(data: typeof wishlist_analytics_events.$inferInsert): Promise<void> {
    await db.insert(wishlist_analytics_events).values(data);
  }

  async get_event_count_by_type(
    event_type: string,
    since?: string,
  ): Promise<number> {
    const conditions: ReturnType<typeof eq | typeof gte>[] = [
      eq(wishlist_analytics_events.event_type, event_type),
    ];
    if (since) conditions.push(gte(wishlist_analytics_events.created_at, since));

    const [row] = await db
      .select({ total: count() })
      .from(wishlist_analytics_events)
      .where(and(...conditions));
    return Number(row.total);
  }

  async get_growth_data(
    period_days: number,
  ): Promise<Array<{ date: string; count: number }>> {
    const since = new Date(Date.now() - period_days * 86400000).toISOString();
    const result = await db
      .select({
        date: sql<string>`DATE(${wishlists.created_at})`,
        count: count(),
      })
      .from(wishlists)
      .where(gte(wishlists.created_at, since))
      .groupBy(sql`DATE(${wishlists.created_at})`)
      .orderBy(sql`DATE(${wishlists.created_at})`);

    return result.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async get_conversion_trends(
    period_days: number,
  ): Promise<Array<{ date: string; conversions: number; adds: number }>> {
    const since = new Date(Date.now() - period_days * 86400000).toISOString();
    const result = await db
      .select({
        date: sql<string>`DATE(${wishlist_analytics_events.created_at})`,
        event_type: wishlist_analytics_events.event_type,
        count: count(),
      })
      .from(wishlist_analytics_events)
      .where(
        and(
          gte(wishlist_analytics_events.created_at, since),
          sql`${wishlist_analytics_events.event_type} IN ('add_to_wishlist', 'purchase_from_wishlist')`,
        ),
      )
      .groupBy(
        sql`DATE(${wishlist_analytics_events.created_at})`,
        wishlist_analytics_events.event_type,
      )
      .orderBy(sql`DATE(${wishlist_analytics_events.created_at})`);

    const grouped: Record<string, { conversions: number; adds: number }> = {};
    for (const row of result) {
      if (!grouped[row.date]) grouped[row.date] = { conversions: 0, adds: 0 };
      if (row.event_type === "purchase_from_wishlist") grouped[row.date].conversions += Number(row.count);
      if (row.event_type === "add_to_wishlist") grouped[row.date].adds += Number(row.count);
    }

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      conversions: data.conversions,
      adds: data.adds,
    }));
  }

  async get_most_wished_products(
    limit = 10,
    period_days?: number,
  ): Promise<Array<{ product_id: string; count: number }>> {
    const conditions: ReturnType<typeof eq | typeof gte>[] = [
      eq(wishlist_analytics_events.event_type, "add_to_wishlist"),
      sql`${wishlist_analytics_events.product_id} IS NOT NULL`,
    ];
    if (period_days) {
      const since = new Date(Date.now() - period_days * 86400000).toISOString();
      conditions.push(gte(wishlist_analytics_events.created_at, since));
    }

    const result = await db
      .select({
        product_id: wishlist_analytics_events.product_id,
        count: count(),
      })
      .from(wishlist_analytics_events)
      .where(and(...conditions))
      .groupBy(wishlist_analytics_events.product_id)
      .orderBy(desc(count()))
      .limit(limit);

    return result.map((r) => ({ product_id: r.product_id!, count: Number(r.count) }));
  }

  async get_total_adds(since?: string): Promise<number> {
    const conditions: ReturnType<typeof eq | typeof gte>[] = [
      eq(wishlist_analytics_events.event_type, "add_to_wishlist"),
    ];
    if (since) conditions.push(gte(wishlist_analytics_events.created_at, since));
    const [row] = await db
      .select({ total: count() })
      .from(wishlist_analytics_events)
      .where(and(...conditions));
    return Number(row.total);
  }

  async get_total_conversions(since?: string): Promise<number> {
    const conditions: ReturnType<typeof eq | typeof gte>[] = [
      eq(wishlist_analytics_events.event_type, "purchase_from_wishlist"),
    ];
    if (since) conditions.push(gte(wishlist_analytics_events.created_at, since));
    const [row] = await db
      .select({ total: count() })
      .from(wishlist_analytics_events)
      .where(and(...conditions));
    return Number(row.total);
  }

  async get_events_by_type_since(
    event_type: string,
    since: string,
  ): Promise<Array<{ id: string; customer_id: string | null; product_id: string | null; wishlist_id: string | null; metadata: unknown; created_at: string }>> {
    return db
      .select({
        id: wishlist_analytics_events.id,
        customer_id: wishlist_analytics_events.customer_id,
        product_id: wishlist_analytics_events.product_id,
        wishlist_id: wishlist_analytics_events.wishlist_id,
        metadata: wishlist_analytics_events.metadata,
        created_at: wishlist_analytics_events.created_at,
      })
      .from(wishlist_analytics_events)
      .where(
        and(
          eq(wishlist_analytics_events.event_type, event_type),
          gte(wishlist_analytics_events.created_at, since),
        ),
      )
      .orderBy(desc(wishlist_analytics_events.created_at));
  }
}

export const wishlist_analytics_repository = new WishlistAnalyticsRepository();
