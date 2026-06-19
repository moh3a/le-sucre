import "server-only";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventory_forecast_snapshots, inventory_alerts } from "../schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import { inventory_levels } from "@/features/inventory_management_system/inventory/schema";

export const forecast_analytics_queries = {
  async dashboard(input: { risk_level?: string; page: number; limit: number }) {
    const offset = (input.page - 1) * input.limit;
    const where = input.risk_level
      ? eq(inventory_forecast_snapshots.risk_level, input.risk_level)
      : undefined;

    const [[{ total }], rows] = await Promise.all([
      db.select({ total: count() }).from(inventory_forecast_snapshots).where(where),
      db
        .select({
          sku_id: inventory_forecast_snapshots.sku_id,
          sku_code: product_skus.sku_code,
          product_name: product_translations.name,
          avg_daily_sales: inventory_forecast_snapshots.avg_daily_sales,
          days_until_stockout: inventory_forecast_snapshots.days_until_stockout,
          recommended_reorder_qty: inventory_forecast_snapshots.recommended_reorder_qty,
          safety_stock: inventory_forecast_snapshots.safety_stock,
          risk_level: inventory_forecast_snapshots.risk_level,
          computed_at: inventory_forecast_snapshots.computed_at,
          current_stock: inventory_levels.quantity_on_hand,
          reserved_stock: inventory_levels.quantity_reserved,
        })
        .from(inventory_forecast_snapshots)
        .innerJoin(product_skus, eq(product_skus.id, inventory_forecast_snapshots.sku_id))
        .leftJoin(
          product_translations,
          eq(product_skus.product_id, product_translations.product_id),
        )
        .leftJoin(
          inventory_levels,
          and(
            eq(inventory_levels.sku_id, inventory_forecast_snapshots.sku_id),
            eq(inventory_levels.warehouse_id, inventory_forecast_snapshots.warehouse_id),
          ),
        )
        .where(where)
        .orderBy(
          desc(
            sql`CASE risk_level WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'normal' THEN 2 ELSE 1 END`,
          ),
          inventory_forecast_snapshots.days_until_stockout,
        )
        .limit(input.limit)
        .offset(offset),
    ]);

    const [{ open_alerts }] = await db
      .select({ open_alerts: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(inventory_alerts)
      .where(eq(inventory_alerts.status, "open"));

    return {
      items: rows,
      open_alerts,
      meta: {
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  },

  async stats() {
    const [critical, high, normal, low, openAlerts] = await Promise.all([
      db
        .select({ count: count() })
        .from(inventory_forecast_snapshots)
        .where(eq(inventory_forecast_snapshots.risk_level, "critical")),
      db
        .select({ count: count() })
        .from(inventory_forecast_snapshots)
        .where(eq(inventory_forecast_snapshots.risk_level, "high")),
      db
        .select({ count: count() })
        .from(inventory_forecast_snapshots)
        .where(eq(inventory_forecast_snapshots.risk_level, "normal")),
      db
        .select({ count: count() })
        .from(inventory_forecast_snapshots)
        .where(eq(inventory_forecast_snapshots.risk_level, "low")),
      db
        .select({ count: count() })
        .from(inventory_alerts)
        .where(eq(inventory_alerts.status, "open")),
    ]);

    const total = critical[0].count + high[0].count + normal[0].count + low[0].count;

    const [{ avg_days }] = await db
      .select({
        avg_days: sql<number>`ROUND(AVG(days_until_stockout), 0)`.mapWith(Number),
      })
      .from(inventory_forecast_snapshots);

    return {
      total,
      critical: critical[0].count,
      high: high[0].count,
      normal: normal[0].count,
      low: low[0].count,
      open_alerts: openAlerts[0].count,
      avg_days_until_stockout: avg_days,
    };
  },
};
