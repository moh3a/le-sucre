import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventory_repository } from "@/features/inventory_management_system/inventory/repositories/inventory.repository";
import { reservation_service } from "@/features/inventory_management_system/inventory/services/reservation.service";
import { preorder_repository } from "../repositories/preorder.repository";
import { PREORDER_LINE_STATUS } from "../constants/preorder-status";
import { order_items, orders } from "@/features/order_management_system/orders/schema";
import { preorder_allocations } from "../schema";

export class PreorderFulfillmentService {
  async fulfill_incoming_stock(sku_id: string, warehouse_id = "default") {
    const level = await inventory_repository.get_level(sku_id, warehouse_id);
    let available = Math.max(0, (level?.quantity_on_hand ?? 0) - (level?.quantity_reserved ?? 0));

    const queue = await preorder_repository.list_confirmed_fifo(sku_id);

    for (const alloc of queue) {
      if (available < alloc.quantity || !alloc.order_id) continue;

      const reservation = await reservation_service.create({
        sku_id,
        warehouse_id,
        quantity: alloc.quantity,
        cart_id: undefined,
        expires_in_sec: 3600,
      });

      await reservation_service.commit({
        id: reservation.id,
        order_id: alloc.order_id,
      });

      await preorder_repository.mark_fulfilled(alloc.id);

      if (alloc.order_item_id) {
        await db
          .update(order_items)
          .set({
            preorder_status: PREORDER_LINE_STATUS.ready_to_ship,
            reservation_id: reservation.id,
          })
          .where(eq(order_items.id, alloc.order_item_id));
      }

      // Set order's fulfillment_status to partial
      await db
        .update(orders)
        .set({ fulfillment_status: "partial" })
        .where(eq(orders.id, alloc.order_id));

      // Insert inventory movement for preorder fulfillment
      await db.transaction(async (tx) => {
        await inventory_repository.insert_movement(tx, {
          sku_id,
          warehouse_id,
          movement_type: "preorder_fulfill",
          quantity_delta: -alloc.quantity,
          reference_type: "preorder_allocation",
          reference_id: alloc.id,
        });
      });

      available -= alloc.quantity;
    }
  }

  async fulfill_all_confirmed(warehouse_id = "default") {
    const active_skus = await db
      .select({ sku_id: preorder_allocations.sku_id })
      .from(preorder_allocations)
      .where(eq(preorder_allocations.status, "confirmed"))
      .groupBy(preorder_allocations.sku_id);

    for (const row of active_skus) {
      try {
        await this.fulfill_incoming_stock(row.sku_id, warehouse_id);
      } catch {
        // Log or handle error to keep processing other SKUs
      }
    }
  }
}
export const preorder_fulfillment_service = new PreorderFulfillmentService();
