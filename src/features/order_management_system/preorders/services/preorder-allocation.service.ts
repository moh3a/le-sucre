// services/preorder-allocation.service.ts
import "server-only";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { ConflictError } from "@/lib/error_handling";
import { preorder_allocations } from "../schema";
import { preorder_repository } from "../repositories/preorder.repository";
import { PREORDER_ALLOCATION_STATUS } from "../constants/preorder-status";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class PreorderAllocationService {
  async reserve_for_cart(input: {
    sku_id: string;
    quantity: number;
    cart_id: string;
    estimated_available_at?: string | null;
  }) {
    return db.transaction(async (tx) => {
      const settings = await preorder_repository.get_settings_for_update(tx, input.sku_id);
      if (!settings?.is_preorder_enabled && !settings?.allow_backorder) {
        throw new ConflictError("Précommande non disponible");
      }

      if (settings.is_preorder_enabled && settings.max_preorder_qty != null) {
        const next = settings.preorder_sold + input.quantity;
        if (next > settings.max_preorder_qty) throw new ConflictError("Quota précommande atteint");
        await preorder_repository.increment_preorder_sold(tx, input.sku_id, input.quantity);
      }

      const id = generate_id();
      await tx.insert(preorder_allocations).values({
        id,
        sku_id: input.sku_id,
        quantity: input.quantity,
        cart_id: input.cart_id,
        status: PREORDER_ALLOCATION_STATUS.pending,
        estimated_available_at: input.estimated_available_at ?? settings.estimated_available_at,
      });
      void audit_service.log({
        action: "preorder.reserve_for_cart",
        resource_type: "sku_id",
        resource_id: input.sku_id,
      });
      return { id };
    });
  }

  async confirm_for_order(allocation_id: string, order_id: string, order_item_id: string) {
    await preorder_repository.confirm_allocation(allocation_id, order_id, order_item_id);
  }

  async cancel(allocation_id: string) {
    await preorder_repository.cancel_allocation(allocation_id);
  }
}
export const preorder_allocation_service = new PreorderAllocationService();
