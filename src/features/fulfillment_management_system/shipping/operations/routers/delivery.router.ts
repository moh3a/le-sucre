import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { delivery_service } from "../services/delivery.service";

export const delivery_operations_router = create_trpc_router({
  deliveryLogAttempt: permission_procedure(PERMISSIONS.delivery_manage)
    .input(
      z.object({
        shipment_id: z.string(),
        order_id: z.string(),
        status: z.enum([
          "successful",
          "failed",
          "customer_unavailable",
          "wrong_address",
          "refused",
          "cancelled",
        ]),
        description: z.string().optional(),
        attempted_at: z.string().optional(),
        next_attempt_at: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      delivery_service.log_attempt({ ...input, delivery_person_id: ctx.session!.user.id }),
    ),

  deliveryGetAttemptsByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => delivery_service.get_attempts_by_order(input.order_id)),

  deliveryGetAttemptsByShipment: permission_procedure(PERMISSIONS.shipping_read)
    .input(z.object({ shipment_id: z.string() }))
    .query(({ input }) => delivery_service.get_attempts_by_shipment(input.shipment_id)),

  deliveryRetry: permission_procedure(PERMISSIONS.delivery_manage)
    .input(z.object({ order_id: z.string(), scheduled_at: z.string() }))
    .mutation(({ ctx, input }) =>
      delivery_service.retry_delivery({ ...input, delivery_person_id: ctx.session!.user.id }),
    ),

  deliveryReturnToWarehouse: permission_procedure(PERMISSIONS.delivery_manage)
    .input(z.object({ order_id: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      delivery_service.return_to_warehouse({
        ...input,
        initiated_by_user_id: ctx.session!.user.id,
      }),
    ),

  deliveryListAttempts: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
        delivery_person_id: z.string().optional(),
      }),
    )
    .query(({ input }) =>
      delivery_service.list_attempts(
        input.page,
        input.limit,
        input.status,
        input.delivery_person_id,
      ),
    ),

  deliveryGetStats: permission_procedure(PERMISSIONS.orders_read).query(() =>
    delivery_service.get_stats(),
  ),
});
