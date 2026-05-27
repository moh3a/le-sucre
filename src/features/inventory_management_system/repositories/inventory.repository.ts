import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db, type DbClient } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { product_skus } from "@/features/product_information_management/variants/schema";

import { DEFAULT_WAREHOUSE_ID, RESERVATION_STATUS } from "../constants/movement-types";
import { inventory_levels, inventory_movements, inventory_reservations } from "../schema";

type Tx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

export class InventoryRepository {
  async get_level(sku_id: string, warehouse_id = DEFAULT_WAREHOUSE_ID) {
    const [row] = await db
      .select()
      .from(inventory_levels)
      .where(
        and(eq(inventory_levels.sku_id, sku_id), eq(inventory_levels.warehouse_id, warehouse_id)),
      )
      .limit(1);
    return row ?? null;
  }

  async get_level_for_update(tx: Tx, sku_id: string, warehouse_id = DEFAULT_WAREHOUSE_ID) {
    const [row] = await tx
      .select()
      .from(inventory_levels)
      .where(
        and(eq(inventory_levels.sku_id, sku_id), eq(inventory_levels.warehouse_id, warehouse_id)),
      )
      .for("update")
      .limit(1);
    return row ?? null;
  }

  async ensure_level(sku_id: string, warehouse_id = DEFAULT_WAREHOUSE_ID) {
    const existing = await this.get_level(sku_id, warehouse_id);
    if (existing) return existing;

    const id = generate_id();
    await db.insert(inventory_levels).values({
      id,
      sku_id,
      warehouse_id,
      quantity_on_hand: 0,
      quantity_reserved: 0,
      version: 0,
    });

    return (await this.get_level(sku_id, warehouse_id))!;
  }

  async list_by_product(product_id: string, warehouse_id = DEFAULT_WAREHOUSE_ID) {
    return db
      .select({
        sku_id: product_skus.id,
        sku_code: product_skus.sku_code,
        stock_available: product_skus.stock_available,
        quantity_on_hand: inventory_levels.quantity_on_hand,
        quantity_reserved: inventory_levels.quantity_reserved,
        warehouse_id: inventory_levels.warehouse_id,
      })
      .from(product_skus)
      .leftJoin(
        inventory_levels,
        and(
          eq(inventory_levels.sku_id, product_skus.id),
          eq(inventory_levels.warehouse_id, warehouse_id),
        ),
      )
      .where(eq(product_skus.product_id, product_id))
      .orderBy(product_skus.sku_code);
  }

  async list_movements(sku_id: string, warehouse_id: string, limit: number) {
    return db
      .select()
      .from(inventory_movements)
      .where(
        and(
          eq(inventory_movements.sku_id, sku_id),
          eq(inventory_movements.warehouse_id, warehouse_id),
        ),
      )
      .orderBy(desc(inventory_movements.created_at))
      .limit(limit);
  }

  async insert_movement(
    tx: Tx,
    input: {
      sku_id: string;
      warehouse_id: string;
      movement_type: string;
      quantity_delta: number;
      reference_type?: string | null;
      reference_id?: string | null;
    },
  ) {
    await tx.insert(inventory_movements).values({
      id: generate_id(),
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      movement_type: input.movement_type,
      quantity_delta: input.quantity_delta,
      reference_type: input.reference_type ?? null,
      reference_id: input.reference_id ?? null,
    });
  }

  async update_level_optimistic(
    tx: Tx,
    level_id: string,
    expected_version: number,
    patch: Partial<{
      quantity_on_hand: number;
      quantity_reserved: number;
    }>,
  ) {
    const result = await tx
      .update(inventory_levels)
      .set({
        ...patch,
        version: expected_version + 1,
      })
      .where(
        and(eq(inventory_levels.id, level_id), eq(inventory_levels.version, expected_version)),
      );

    return (result as { rowsAffected?: number }).rowsAffected !== 0;
  }

  async get_reservation_for_update(tx: Tx, id: string) {
    const [row] = await tx
      .select()
      .from(inventory_reservations)
      .where(eq(inventory_reservations.id, id))
      .for("update")
      .limit(1);
    return row ?? null;
  }

  async create_reservation(
    tx: Tx,
    input: {
      sku_id: string;
      warehouse_id: string;
      quantity: number;
      cart_id?: string | null;
      expires_at: string;
    },
  ) {
    const id = generate_id();
    await tx.insert(inventory_reservations).values({
      id,
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      quantity: input.quantity,
      status: RESERVATION_STATUS.active,
      cart_id: input.cart_id ?? null,
      order_id: null,
      expires_at: input.expires_at,
    });
    return id;
  }

  async set_reservation_status(
    tx: Tx,
    id: string,
    status: string,
    patch?: { order_id?: string | null },
  ) {
    await tx
      .update(inventory_reservations)
      .set({
        status,
        ...(patch?.order_id !== undefined && { order_id: patch.order_id }),
      })
      .where(eq(inventory_reservations.id, id));
  }
}

export const inventory_repository = new InventoryRepository();
