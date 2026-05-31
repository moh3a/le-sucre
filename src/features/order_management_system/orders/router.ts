import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { order_service } from "./services/order.service";
import { admin_update_order_status_dto, list_orders_dto } from "./models/order.dto";
import { order_admin_service } from "./services/order-admin.service";

export const order_router = create_trpc_router({
  myOrders: storefront_procedure
    .input(list_orders_dto)
    .query(({ ctx, input }) => order_service.list_for_customer(ctx.session!.user.id, input)),

  myOrderById: storefront_procedure
    .input(z.object({ order_id: z.string().min(1).max(255) }))
    .query(({ ctx, input }) =>
      order_service.get_customer_detail(input.order_id, ctx.session!.user.id),
    ),

  adminList: permission_procedure(PERMISSIONS.orders_read)
    .input(list_orders_dto)
    .query(({ input }) => order_service.admin_list(input)),

  adminListByProduct: permission_procedure(PERMISSIONS.orders_read)
    .input(list_orders_dto.and(z.object({ product_id: z.string() })))
    .query(({ input }) =>
      order_service.admin_list_by_product(input.product_id, input.page, input.limit),
    ),

  adminGet: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string().min(1).max(255) }))
    .query(({ input }) => order_service.admin_get(input.order_id)),

  adminTransition: permission_procedure(PERMISSIONS.orders_write)
    .input(admin_update_order_status_dto)
    .mutation(({ ctx, input }) =>
      order_service.transition_status({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminStats: permission_procedure(PERMISSIONS.orders_read).query(() =>
    order_admin_service.stats(),
  ),

  // TODO add adminListEnriched, adminCharts via order_admin_service
});
