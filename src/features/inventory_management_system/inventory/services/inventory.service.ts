import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/error_handling";
import { product_skus } from "@/features/product_information_management/variants/schema";

import type {
  adjust_stock_dto,
  set_stock_dto,
  receive_stock_dto,
  list_movements_dto,
} from "../models/inventory.dto";
import { MOVEMENT_TYPES } from "../constants/movement-types";
import { INVENTORY_ERROR } from "../constants/error-codes";
import { throw_error } from "../../shared/error-codes";
import { inventory_repository } from "../repositories/inventory.repository";
import {
  invalidate_product_stock_cache,
  sync_sku_stock_denormalized,
} from "../helpers/stock-sync.helper";
import { forecast_index_service } from "../../forecasting/services/forecast-index.service";
import { preorder_fulfillment_service } from "@/features/order_management_system/preorders/services/preorder-fulfillment.service";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class InventoryService {
  constructor(private readonly repo = inventory_repository) {}

  private async assert_sku(sku_id: string) {
    const [sku] = await db
      .select({ id: product_skus.id, product_id: product_skus.product_id })
      .from(product_skus)
      .where(eq(product_skus.id, sku_id))
      .limit(1);
    if (!sku) throw_error(INVENTORY_ERROR.SKU_NOT_FOUND, { sku_id });
    return sku!;
  }

  private async apply_on_hand_change(input: {
    sku_id: string;
    warehouse_id: string;
    new_on_hand: number;
    movement_type: string;
    quantity_delta: number;
    reference_type?: string | null;
    reference_id?: string | null;
  }) {
    await this.repo.ensure_level(input.sku_id, input.warehouse_id);

    const product_id = await db.transaction(async (tx) => {
      const level = await this.repo.get_level_for_update(tx, input.sku_id, input.warehouse_id);
      if (!level) throw_error(INVENTORY_ERROR.LEVEL_NOT_FOUND, { sku_id: input.sku_id });

      if (input.new_on_hand < 0) throw_error(INVENTORY_ERROR.NEGATIVE_STOCK, { sku_id: input.sku_id, warehouse_id: input.warehouse_id });
      if (input.new_on_hand < level.quantity_reserved) {
        throw_error(INVENTORY_ERROR.STOCK_BELOW_RESERVED, {
          sku_id: input.sku_id,
          on_hand: input.new_on_hand,
          reserved: level.quantity_reserved,
        });
      }

      const ok = await this.repo.update_level_optimistic(tx, level.id, level.version, {
        quantity_on_hand: input.new_on_hand,
      });
      if (!ok) throw_error(INVENTORY_ERROR.VERSION_CONFLICT, { level_id: level.id });

      await this.repo.insert_movement(tx, {
        sku_id: input.sku_id,
        warehouse_id: input.warehouse_id,
        movement_type: input.movement_type,
        quantity_delta: input.quantity_delta,
        reference_type: input.reference_type ?? null,
        reference_id: input.reference_id ?? null,
      });

      return sync_sku_stock_denormalized(input.sku_id, tx);
    });

    if (product_id) await invalidate_product_stock_cache(product_id);
  }

  async get_level(sku_id: string, warehouse_id: string) {
    await this.assert_sku(sku_id);
    const level = await this.repo.ensure_level(sku_id, warehouse_id);
    const available = Math.max(0, level.quantity_on_hand - level.quantity_reserved);
    return { level, available };
  }

  async list_by_product(product_id: string, warehouse_id: string) {
    const rows = await this.repo.list_by_product(product_id, warehouse_id);
    return {
      product_id,
      warehouse_id,
      items: rows.map((row) => ({
        sku_id: row.sku_id,
        sku_code: row.sku_code,
        warehouse_id: row.warehouse_id ?? warehouse_id,
        quantity_on_hand: row.quantity_on_hand ?? 0,
        quantity_reserved: row.quantity_reserved ?? 0,
        stock_available: row.stock_available ?? 0,
      })),
    };
  }

  async list_movements(input: z.infer<typeof list_movements_dto>) {
    await this.assert_sku(input.sku_id);
    const movements = await this.repo.list_movements(input.sku_id, input.warehouse_id, input.limit);
    return { sku_id: input.sku_id, movements };
  }

  async adjust_stock(input: z.infer<typeof adjust_stock_dto>) {
    await this.assert_sku(input.sku_id);
    const level = await this.repo.ensure_level(input.sku_id, input.warehouse_id);
    const new_on_hand = level.quantity_on_hand + input.quantity_delta;

    await this.apply_on_hand_change({
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      new_on_hand,
      movement_type: MOVEMENT_TYPES.adjust,
      quantity_delta: input.quantity_delta,
      reference_type: input.reference_type ?? "manual_adjust",
      reference_id: input.reference_id ?? null,
    });

    void audit_service.log({
      action: "inventory.adjust_stock",
      resource_type: "sku_id",
      resource_id: input.sku_id,
    });
    return this.get_level(input.sku_id, input.warehouse_id);
  }

  async set_stock(input: z.infer<typeof set_stock_dto>) {
    await this.assert_sku(input.sku_id);
    const level = await this.repo.ensure_level(input.sku_id, input.warehouse_id);
    const delta = input.quantity_on_hand - level.quantity_on_hand;

    await this.apply_on_hand_change({
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      new_on_hand: input.quantity_on_hand,
      movement_type: MOVEMENT_TYPES.adjust,
      quantity_delta: delta,
      reference_type: input.reference_type ?? "set_stock",
      reference_id: input.reference_id ?? null,
    });

    void audit_service.log({
      action: "inventory.set_stock",
      resource_type: "sku_id",
      resource_id: input.sku_id,
    });
    return this.get_level(input.sku_id, input.warehouse_id);
  }

  async receive_stock(input: z.infer<typeof receive_stock_dto>) {
    await this.assert_sku(input.sku_id);
    const level = await this.repo.ensure_level(input.sku_id, input.warehouse_id);
    const new_on_hand = level.quantity_on_hand + input.quantity;

    await this.apply_on_hand_change({
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      new_on_hand,
      movement_type: MOVEMENT_TYPES.receive,
      quantity_delta: input.quantity,
      reference_type: input.reference_type ?? "receive",
      reference_id: input.reference_id ?? null,
    });

    void forecast_index_service.enqueue("reindex_sku", { sku_id: input.sku_id });
    void preorder_fulfillment_service.fulfill_incoming_stock(input.sku_id, input.warehouse_id);

    void audit_service.log({
      action: "inventory.receive_stock",
      resource_type: "sku_id",
      resource_id: input.sku_id,
    });
    return this.get_level(input.sku_id, input.warehouse_id);
  }
}

export const inventory_service = new InventoryService();
