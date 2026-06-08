import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { format, subDays } from "date-fns";

import { db } from "@/lib/db";
import { inventory_sales_velocity_daily } from "../schema";

export class VelocityRepository {
  async list_series(sku_id: string, warehouse_id: string, window_days: number) {
    const day_key = format(subDays(new Date(), window_days), "yyyy-MM-dd");

    const rows = await db
      .select({
        day_key: inventory_sales_velocity_daily.day_key,
        units: inventory_sales_velocity_daily.units_sold,
      })
      .from(inventory_sales_velocity_daily)
      .where(
        and(
          eq(inventory_sales_velocity_daily.sku_id, sku_id),
          eq(inventory_sales_velocity_daily.warehouse_id, warehouse_id),
          gte(inventory_sales_velocity_daily.day_key, day_key),
        ),
      )
      .orderBy(inventory_sales_velocity_daily.day_key);

    return rows.map((r) => ({ day_key: r.day_key, units: r.units }));
  }
}
export const velocity_repository = new VelocityRepository();
