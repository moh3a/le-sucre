import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventory_repository } from "@/features/inventory_management_system/inventory/repositories/inventory.repository";
import { reservation_service } from "@/features/inventory_management_system/inventory/services/reservation.service";
import { preorder_repository } from "../repositories/preorder.repository";
import { PREORDER_LINE_STATUS } from "../constants/preorder-status";
import { order_items } from "@/features/order_management_system/orders/schema";

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

      available -= alloc.quantity;
    }
  }
}
export const preorder_fulfillment_service = new PreorderFulfillmentService();
