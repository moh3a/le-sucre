import "server-only";

import { and, eq, lt } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";

import type { create_reservation_dto, commit_reservation_dto } from "../models/inventory.dto";
import { MOVEMENT_TYPES, RESERVATION_STATUS } from "../constants/movement-types";
import { INVENTORY_ERROR } from "../constants/error-codes";
import { throw_error } from "../../shared/error-codes";
import { inventory_reservations } from "../schema";
import { inventory_repository } from "../repositories/inventory.repository";
import {
  invalidate_product_stock_cache,
  sync_sku_stock_denormalized,
} from "../helpers/stock-sync.helper";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { forecast_index_service } from "../../forecasting/services/forecast-index.service";
import { addSeconds, format } from "date-fns";

export class ReservationService {
  constructor(private readonly repo = inventory_repository) {}

  async create(input: z.infer<typeof create_reservation_dto>) {
    await this.repo.ensure_level(input.sku_id, input.warehouse_id);

    const expires_at = format(
      addSeconds(new Date(), input.expires_in_sec),
      "yyyy-MM-dd HH:mm:ss",
    );

    const reservation_id = await db.transaction(async (tx) => {
      const level = await this.repo.get_level_for_update(tx, input.sku_id, input.warehouse_id);
      if (!level) throw_error(INVENTORY_ERROR.LEVEL_NOT_FOUND, { sku_id: input.sku_id });

      const available = level.quantity_on_hand - level.quantity_reserved;
      if (available < input.quantity) {
        throw_error(INVENTORY_ERROR.STOCK_INSUFFICIENT, {
          sku_id: input.sku_id,
          available,
          requested: input.quantity,
        });
      }

      const ok = await this.repo.update_level_optimistic(tx, level.id, level.version, {
        quantity_reserved: level.quantity_reserved + input.quantity,
      });
      if (!ok) throw_error(INVENTORY_ERROR.VERSION_CONFLICT, { level_id: level.id });

      const id = await this.repo.create_reservation(tx, {
        sku_id: input.sku_id,
        warehouse_id: input.warehouse_id,
        quantity: input.quantity,
        cart_id: input.cart_id ?? null,
        expires_at,
      });

      await this.repo.insert_movement(tx, {
        sku_id: input.sku_id,
        warehouse_id: input.warehouse_id,
        movement_type: MOVEMENT_TYPES.reserve,
        quantity_delta: 0,
        reference_type: "reservation",
        reference_id: id,
      });

      await sync_sku_stock_denormalized(input.sku_id, tx);
      return id;
    });

    void audit_service.log({
      action: "inventory.reservation.create",
      resource_type: "sku_id",
      resource_id: input.sku_id,
    });
    return { id: reservation_id, expires_at };
  }

  async release(reservation_id: string) {
    await db.transaction(async (tx) => {
      const reservation = await this.repo.get_reservation_for_update(tx, reservation_id);
      if (!reservation) throw_error(INVENTORY_ERROR.RESERVATION_NOT_FOUND, { reservation_id });
      if (reservation.status !== RESERVATION_STATUS.active) {
        throw_error(INVENTORY_ERROR.RESERVATION_NOT_ACTIVE, { reservation_id, status: reservation.status });
      }

      const level = await this.repo.get_level_for_update(
        tx,
        reservation.sku_id,
        reservation.warehouse_id,
      );
      if (!level) throw_error(INVENTORY_ERROR.LEVEL_NOT_FOUND, { sku_id: reservation.sku_id });

      const ok = await this.repo.update_level_optimistic(tx, level.id, level.version, {
        quantity_reserved: Math.max(0, level.quantity_reserved - reservation.quantity),
      });
      if (!ok) throw_error(INVENTORY_ERROR.VERSION_CONFLICT, { level_id: level.id });

      await this.repo.set_reservation_status(tx, reservation_id, RESERVATION_STATUS.released);

      await this.repo.insert_movement(tx, {
        sku_id: reservation.sku_id,
        warehouse_id: reservation.warehouse_id,
        movement_type: MOVEMENT_TYPES.release,
        quantity_delta: 0,
        reference_type: "reservation",
        reference_id: reservation_id,
      });

      void audit_service.log({
        action: "inventory.reservation.release",
        resource_type: "reservation_id",
        resource_id: reservation_id,
      });
      const product_id = await sync_sku_stock_denormalized(reservation.sku_id, tx);
      if (product_id) await invalidate_product_stock_cache(product_id);
    });

    return { ok: true };
  }

  async commit(input: z.infer<typeof commit_reservation_dto>) {
    await db.transaction(async (tx) => {
      const reservation = await this.repo.get_reservation_for_update(tx, input.id);
      if (!reservation) throw_error(INVENTORY_ERROR.RESERVATION_NOT_FOUND, { reservation_id: input.id });
      if (reservation.status !== RESERVATION_STATUS.active) {
        throw_error(INVENTORY_ERROR.RESERVATION_NOT_ACTIVE, { reservation_id: input.id, status: reservation.status });
      }

      const level = await this.repo.get_level_for_update(
        tx,
        reservation.sku_id,
        reservation.warehouse_id,
      );
      if (!level) throw_error(INVENTORY_ERROR.LEVEL_NOT_FOUND, { sku_id: reservation.sku_id });

      const new_reserved = level.quantity_reserved - reservation.quantity;
      const new_on_hand = level.quantity_on_hand - reservation.quantity;

      if (new_on_hand < 0) throw_error(INVENTORY_ERROR.RESERVATION_COMMIT_FAILED, {
        sku_id: reservation.sku_id,
        on_hand: level.quantity_on_hand,
        requested: reservation.quantity,
      });

      const ok = await this.repo.update_level_optimistic(tx, level.id, level.version, {
        quantity_reserved: new_reserved,
        quantity_on_hand: new_on_hand,
      });
      if (!ok) throw_error(INVENTORY_ERROR.VERSION_CONFLICT, { level_id: level.id });

      await this.repo.set_reservation_status(tx, input.id, RESERVATION_STATUS.committed, {
        order_id: input.order_id ?? null,
      });

      await this.repo.insert_movement(tx, {
        sku_id: reservation.sku_id,
        warehouse_id: reservation.warehouse_id,
        movement_type: MOVEMENT_TYPES.sale,
        quantity_delta: -reservation.quantity,
        reference_type: "order",
        reference_id: input.order_id ?? input.id,
      });

      void forecast_index_service.enqueue("reindex_sku", { sku_id: reservation.sku_id });
      void audit_service.log({
        action: "inventory.reservation.commit",
        resource_type: "reservation_id",
        resource_id: reservation.id,
      });
      const product_id = await sync_sku_stock_denormalized(reservation.sku_id, tx);
      if (product_id) await invalidate_product_stock_cache(product_id);
    });

    return { ok: true };
  }

  async expire_stale() {
    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const stale = await db
      .select()
      .from(inventory_reservations)
      .where(
        and(
          eq(inventory_reservations.status, RESERVATION_STATUS.active),
          lt(inventory_reservations.expires_at, now),
        ),
      )
      .limit(200);

    let expired = 0;
    for (const row of stale) {
      try {
        await this.release(row.id);
        await db
          .update(inventory_reservations)
          .set({ status: RESERVATION_STATUS.expired })
          .where(eq(inventory_reservations.id, row.id));
        expired += 1;
      } catch {
        // skip row on conflict
      }
    }

    return { expired };
  }
}

export const reservation_service = new ReservationService();
