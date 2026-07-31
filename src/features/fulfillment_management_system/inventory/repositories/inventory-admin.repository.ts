import "server-only";

import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";

import { db } from "@/lib/db";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { products, product_translations } from "@/features/product_information_management/products/schema";

import { inventory_levels, inventory_movements } from "../schema";

export type InventoryStockRow = {
  sku_id: string;
  sku_code: string;
  product_id: string;
  product_name: string | null;
  product_slug: string | null;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  stock_available: number;
  movement_count: number;
  last_movement_at: string | null;
};

export type InventoryMovementRow = {
  id: string;
  sku_id: string;
  sku_code: string | null;
  product_name: string | null;
  warehouse_id: string;
  movement_type: string;
  quantity_delta: number;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
};

export type InventoryStats = {
  total_products: number;
  total_skus: number;
  total_warehouses: number;
  total_stock_value: number;
  total_quantity_on_hand: number;
  total_quantity_reserved: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_movements_count: number;
  forecast_shortages_count: number;
};

export type InventoryChartSeries = {
  day_key: string;
  quantity_added: number;
  quantity_removed: number;
  net_change: number;
};

export class InventoryAdminRepository {
  async stats(): Promise<InventoryStats> {
    const [total_products_result] = await db
      .select({ count: count() })
      .from(products)
      .where(and(eq(products.status, "published")));

    const [total_skus_result] = await db
      .select({ count: count() })
      .from(product_skus)
      .where(eq(product_skus.is_active, true));

    const [warehouse_count_result] = await db
      .select({ count: count() })
      .from(sql`(SELECT DISTINCT warehouse_id FROM inventory_levels) AS wh`);

    const [stock_agg] = await db
      .select({
        on_hand: sql<number>`COALESCE(SUM(${inventory_levels.quantity_on_hand}), 0)`,
        reserved: sql<number>`COALESCE(SUM(${inventory_levels.quantity_reserved}), 0)`,
      })
      .from(inventory_levels);

    const [low_stock_result] = await db
      .select({ count: count() })
      .from(inventory_levels)
      .where(
        and(
          sql`${inventory_levels.quantity_on_hand} > 0`,
          sql`${inventory_levels.quantity_on_hand} <= 5`,
        ),
      );

    const [out_of_stock_result] = await db
      .select({ count: count() })
      .from(inventory_levels)
      .where(eq(inventory_levels.quantity_on_hand, 0));

    const [pending_movements_result] = await db
      .select({ count: count() })
      .from(inventory_movements);

    const total_on_hand = Number(stock_agg?.on_hand ?? 0);
    const total_reserved = Number(stock_agg?.reserved ?? 0);

    return {
      total_products: Number(total_products_result?.count ?? 0),
      total_skus: Number(total_skus_result?.count ?? 0),
      total_warehouses: Number(warehouse_count_result?.count ?? 0),
      total_stock_value: 0,
      total_quantity_on_hand: total_on_hand,
      total_quantity_reserved: total_reserved,
      low_stock_count: Number(low_stock_result?.count ?? 0),
      out_of_stock_count: Number(out_of_stock_result?.count ?? 0),
      pending_movements_count: Number(pending_movements_result?.count ?? 0),
      forecast_shortages_count: 0,
    };
  }

  async list_stock(input: {
    page: number;
    limit: number;
    warehouse_id?: string;
    search?: string;
    low_stock?: boolean;
    out_of_stock?: boolean;
    sort_by?: string;
    sort_dir?: "asc" | "desc";
  }) {
    const offset = (input.page - 1) * input.limit;
    const clauses: ReturnType<typeof sql>[] = [];

    if (input.search) {
      clauses.push(
        sql`(${product_skus.sku_code} LIKE ${`%${input.search}%`} OR ${product_translations.name} LIKE ${`%${input.search}%`})`,
      );
    }

    if (input.low_stock) {
      clauses.push(
        sql`${inventory_levels.quantity_on_hand} > 0 AND ${inventory_levels.quantity_on_hand} <= 5`,
      );
    }

    if (input.out_of_stock) {
      clauses.push(eq(inventory_levels.quantity_on_hand, 0));
    }

    const where = clauses.length ? and(...clauses) : undefined;

    const order_clause =
      input.sort_by === "quantity_on_hand"
        ? input.sort_dir === "asc"
          ? sql`${inventory_levels.quantity_on_hand} ASC`
          : sql`${inventory_levels.quantity_on_hand} DESC`
        : input.sort_by === "sku_code"
          ? input.sort_dir === "asc"
            ? sql`${product_skus.sku_code} ASC`
            : sql`${product_skus.sku_code} DESC`
          : input.sort_by === "stock_available"
            ? input.sort_dir === "asc"
              ? sql`stock_available ASC`
              : sql`stock_available DESC`
            : sql`${inventory_levels.quantity_on_hand} DESC`;

    const items = await db
      .select({
        sku_id: product_skus.id,
        sku_code: product_skus.sku_code,
        product_id: product_skus.product_id,
        product_name: sql<string | null>`COALESCE(${product_translations.name}, ${products.slug})`,
        product_slug: products.slug,
        warehouse_id: inventory_levels.warehouse_id,
        quantity_on_hand: inventory_levels.quantity_on_hand,
        quantity_reserved: inventory_levels.quantity_reserved,
        stock_available: sql<number>`GREATEST(${inventory_levels.quantity_on_hand} - ${inventory_levels.quantity_reserved}, 0)`,
        movement_count: sql<number>`0`,
        last_movement_at: sql<string | null>`NULL`,
      })
      .from(inventory_levels)
      .innerJoin(product_skus, eq(product_skus.id, inventory_levels.sku_id))
      .innerJoin(products, eq(products.id, product_skus.product_id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, "fr"),
        ),
      )
      .where(where)
      .orderBy(order_clause)
      .limit(input.limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(inventory_levels)
      .innerJoin(product_skus, eq(product_skus.id, inventory_levels.sku_id))
      .innerJoin(products, eq(products.id, product_skus.product_id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, "fr"),
        ),
      )
      .where(where);

    const total_records = Number(total ?? 0);

    return {
      items: items as InventoryStockRow[],
      meta: {
        page: input.page,
        limit: input.limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / input.limit)),
        has_more: input.page * input.limit < total_records,
      },
    };
  }

  async list_movements(input: {
    page: number;
    limit: number;
    warehouse_id?: string;
    movement_type?: string;
    from?: string;
    to?: string;
  }) {
    const offset = (input.page - 1) * input.limit;
    const clauses: ReturnType<typeof sql>[] = [];

    if (input.warehouse_id) clauses.push(eq(inventory_movements.warehouse_id, input.warehouse_id));
    if (input.movement_type) clauses.push(eq(inventory_movements.movement_type, input.movement_type));
    if (input.from) clauses.push(gte(inventory_movements.created_at, input.from));
    if (input.to) clauses.push(lte(inventory_movements.created_at, input.to));

    const where = clauses.length ? and(...clauses) : undefined;

    const items = await db
      .select({
        id: inventory_movements.id,
        sku_id: inventory_movements.sku_id,
        sku_code: product_skus.sku_code,
        product_name: sql<string | null>`COALESCE(${product_translations.name}, ${products.slug})`,
        warehouse_id: inventory_movements.warehouse_id,
        movement_type: inventory_movements.movement_type,
        quantity_delta: inventory_movements.quantity_delta,
        reference_type: inventory_movements.reference_type,
        reference_id: inventory_movements.reference_id,
        created_at: inventory_movements.created_at,
      })
      .from(inventory_movements)
      .leftJoin(product_skus, eq(product_skus.id, inventory_movements.sku_id))
      .leftJoin(products, eq(products.id, product_skus.product_id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, "fr"),
        ),
      )
      .where(where)
      .orderBy(desc(inventory_movements.created_at))
      .limit(input.limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(inventory_movements)
      .leftJoin(product_skus, eq(product_skus.id, inventory_movements.sku_id))
      .leftJoin(products, eq(products.id, product_skus.product_id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, "fr"),
        ),
      )
      .where(where);

    const total_records = Number(total ?? 0);

    return {
      items: items as InventoryMovementRow[],
      meta: {
        page: input.page,
        limit: input.limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / input.limit)),
        has_more: input.page * input.limit < total_records,
      },
    };
  }

  async charts(days = 30) {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");

    const series = await db
      .select({
        day_key: sql<string>`DATE(${inventory_movements.created_at})`,
        quantity_added: sql<number>`COALESCE(SUM(CASE WHEN ${inventory_movements.quantity_delta} > 0 THEN ${inventory_movements.quantity_delta} ELSE 0 END), 0)`,
        quantity_removed: sql<number>`COALESCE(SUM(CASE WHEN ${inventory_movements.quantity_delta} < 0 THEN ABS(${inventory_movements.quantity_delta}) ELSE 0 END), 0)`,
        net_change: sql<number>`COALESCE(SUM(${inventory_movements.quantity_delta}), 0)`,
      })
      .from(inventory_movements)
      .where(gte(inventory_movements.created_at, since))
      .groupBy(sql`DATE(${inventory_movements.created_at})`)
      .orderBy(sql`DATE(${inventory_movements.created_at})`);

    const movement_distribution = await db
      .select({
        movement_type: inventory_movements.movement_type,
        count: count(),
      })
      .from(inventory_movements)
      .where(gte(inventory_movements.created_at, since))
      .groupBy(inventory_movements.movement_type)
      .orderBy(desc(count()));

    return {
      series: series as InventoryChartSeries[],
      movement_distribution: movement_distribution as { movement_type: string; count: number }[],
    };
  }
}

export const inventory_admin_repository = new InventoryAdminRepository();
