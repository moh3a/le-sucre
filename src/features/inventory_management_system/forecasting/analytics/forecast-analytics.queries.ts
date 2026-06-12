import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventory_forecast_snapshots, inventory_alerts } from "../schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { inventory_levels } from "@/features/inventory_management_system/inventory/schema";

export const forecast_analytics_queries = {
  async dashboard(input: { risk_level?: string; page: number; limit: number }) {
    const offset = (input.page - 1) * input.limit;
    const where = input.risk_level
      ? eq(inventory_forecast_snapshots.risk_level, input.risk_level)
      : undefined;

    const rows = await db
      .select({
        sku_id: inventory_forecast_snapshots.sku_id,
        sku_code: product_skus.sku_code,
        avg_daily_sales: inventory_forecast_snapshots.avg_daily_sales,
        days_until_stockout: inventory_forecast_snapshots.days_until_stockout,
        recommended_reorder_qty: inventory_forecast_snapshots.recommended_reorder_qty,
        risk_level: inventory_forecast_snapshots.risk_level,
        computed_at: inventory_forecast_snapshots.computed_at,
        current_stock: inventory_levels.quantity_on_hand,
        reserved_stock: inventory_levels.quantity_reserved,
      })
      .from(inventory_forecast_snapshots)
      .innerJoin(product_skus, eq(product_skus.id, inventory_forecast_snapshots.sku_id))
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
      .offset(offset);

    const [{ open_alerts }] = await db
      .select({ open_alerts: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(inventory_alerts)
      .where(eq(inventory_alerts.status, "open"));

    return { rows, open_alerts };
  },
};
