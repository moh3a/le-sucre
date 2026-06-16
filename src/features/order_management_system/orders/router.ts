import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { order_service } from "./services/order.service";
import {
  admin_update_order_status_dto,
  list_orders_dto,
  admin_list_enriched_dto,
  admin_create_order_dto,
} from "./models/order.dto";
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

  adminListEnriched: permission_procedure(PERMISSIONS.orders_read)
    .input(admin_list_enriched_dto)
    .query(({ input }) => order_admin_service.list_enriched(input)),

  adminCharts: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ days: z.coerce.number().int().min(7).max(365).default(30) }).optional())
    .query(({ input }) => order_admin_service.charts(input?.days)),

  adminAssignOperator: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string().min(1).max(255),
        operator_id: z.string().max(255).nullable(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_service.assign_operator({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminAssignDeliveryPerson: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string().min(1).max(255),
        delivery_person_id: z.string().max(255).nullable(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_service.assign_delivery_person({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminUpdateNotes: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string().min(1).max(255),
        notes: z.string().max(4096).nullable(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_service.update_notes({
        order_id: input.order_id,
        notes: input.notes,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminCreateOrder: permission_procedure(PERMISSIONS.orders_write)
    .input(admin_create_order_dto)
    .mutation(({ input }) => order_service.admin_create(input)),
});
