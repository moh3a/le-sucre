import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function rebuild_velocity_from_orders(window_days = 90) {
  await db.execute(sql`
    INSERT INTO inventory_sales_velocity_daily
      (id, sku_id, warehouse_id, day_key, units_sold, units_returned, revenue, updated_at)
    SELECT
      SUBSTRING(REPLACE(UUID(), '-', ''), 1, 24),
      oi.sku_id,
      'default',
      DATE_FORMAT(o.placed_at, '%Y-%m-%d'),
      SUM(oi.quantity),
      0,
      SUM(oi.line_total),
      NOW()
    FROM order_items oi
    INNER JOIN orders o ON o.id = oi.order_id
    WHERE o.payment_status = 'paid'
      AND o.placed_at >= DATE_SUB(NOW(), INTERVAL ${window_days} DAY)
    GROUP BY oi.sku_id, DATE_FORMAT(o.placed_at, '%Y-%m-%d')
    ON DUPLICATE KEY UPDATE
      units_sold = VALUES(units_sold),
      revenue = VALUES(revenue),
      updated_at = NOW()
  `);
}

export function compute_ema_velocity(series: number[], alpha = 0.3) {
  if (!series.length) return 0;
  let ema = series[0];
  for (let i = 1; i < series.length; i++) ema = alpha * series[i] + (1 - alpha) * ema;
  return ema;
}

export function linear_trend_slope(values: number[]) {
  const n = values.length;
  if (n < 2) return 0;
  const xs = values.map((_, i) => i);
  const mean_x = xs.reduce((a, b) => a + b, 0) / n;
  const mean_y = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mean_x) * (values[i] - mean_y);
    den += (xs[i] - mean_x) ** 2;
  }
  return den === 0 ? 0 : num / den;
}
