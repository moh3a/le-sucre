import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { ConflictError } from "@/lib/error_handling";

export async function reserve_flash_sale_units(
  flash_sale_id: string,
  sku_id: string,
  quantity: number,
) {
  const result = await db.execute(sql`
    UPDATE flash_sale_items
    SET sold_quantity = sold_quantity + ${quantity}, version = version + 1
    WHERE flash_sale_id = ${flash_sale_id}
      AND sku_id = ${sku_id}
      AND sold_quantity + ${quantity} <= max_quantity
  `);

  const affected = result[0]?.affectedRows ?? 0;
  if (!affected) throw new ConflictError("Stock vente flash épuisé");

  await db.execute(sql`
    UPDATE flash_sales
    SET sold_total_units = sold_total_units + ${quantity}
    WHERE id = ${flash_sale_id}
      AND (max_total_units IS NULL OR sold_total_units + ${quantity} <= max_total_units)
  `);
}

export function is_flash_sale_live(row: { status: string; starts_at: string; ends_at: string }) {
  if (row.status !== "active") return false;
  const now = Date.now();
  return new Date(row.starts_at).getTime() <= now && new Date(row.ends_at).getTime() >= now;
}
