import "server-only";

import { sql } from "drizzle-orm";

import { db, type DbClient } from "@/lib/db";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { FLASH_SALE_ERROR } from "../constants/error-codes";

type Tx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

export async function reserve_flash_sale_units(
  flash_sale_id: string,
  sku_id: string,
  quantity: number,
  tx?: Tx,
) {
  const run = async (client: Tx) => {
    const result = await client.execute(sql`
      UPDATE flash_sale_items
      SET sold_quantity = sold_quantity + ${quantity}, version = version + 1
      WHERE flash_sale_id = ${flash_sale_id}
        AND sku_id = ${sku_id}
        AND sold_quantity + ${quantity} <= max_quantity
    `);

    const affected = result[0]?.affectedRows ?? 0;
    if (!affected) throw_error(FLASH_SALE_ERROR.STOCK_EXCEEDED);

    await client.execute(sql`
      UPDATE flash_sales
      SET sold_total_units = sold_total_units + ${quantity}
      WHERE id = ${flash_sale_id}
        AND (max_total_units IS NULL OR sold_total_units + ${quantity} <= max_total_units)
    `);
  };

  if (tx) {
    await run(tx);
  } else {
    await db.transaction(run);
  }
}

export async function release_flash_sale_units_for_order(order_id: string, tx?: Tx) {
  const run = async (client: Tx) => {
    await client.execute(sql`
      UPDATE flash_sale_items fsi
      INNER JOIN (
        SELECT
          sku_id,
          quantity,
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.flash_sale_id')) AS flash_sale_id
        FROM order_items
        WHERE order_id = ${order_id}
          AND JSON_EXTRACT(metadata, '$.flash_sale_id') IS NOT NULL
      ) oi ON oi.flash_sale_id = fsi.flash_sale_id AND oi.sku_id = fsi.sku_id
      SET fsi.sold_quantity = GREATEST(0, fsi.sold_quantity - oi.quantity)
    `);

    await client.execute(sql`
      UPDATE flash_sales fs
      INNER JOIN (
        SELECT
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.flash_sale_id')) AS flash_sale_id,
          SUM(quantity) AS qty
        FROM order_items
        WHERE order_id = ${order_id}
          AND JSON_EXTRACT(metadata, '$.flash_sale_id') IS NOT NULL
        GROUP BY JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.flash_sale_id'))
      ) oi ON oi.flash_sale_id = fs.id
      SET fs.sold_total_units = GREATEST(0, fs.sold_total_units - oi.qty)
    `);
  };

  if (tx) {
    await run(tx);
  } else {
    await db.transaction(run);
  }
}

export function is_flash_sale_live(row: { status: string; starts_at: string; ends_at: string }) {
  if (row.status !== "active") return false;
  const now = Date.now();
  return new Date(row.starts_at).getTime() <= now && new Date(row.ends_at).getTime() >= now;
}
