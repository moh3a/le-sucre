import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { return_service } from "./services/return.service";
import {
  create_return_request_dto,
  customer_create_return_request_dto,
  review_return_request_dto,
  receive_return_dto,
  complete_return_dto,
  cancel_return_request_dto,
  list_return_requests_dto,
  admin_list_return_requests_dto,
} from "./models/return.dto";

export const return_replacement_router = create_trpc_router({
  // Customer-facing procedures
  myReturns: storefront_procedure
    .input(z.object({}).optional())
    .query(({ ctx }) =>
      return_service.customer_list_all(ctx.session!.user.id),
    ),

  myCreateReturnRequest: storefront_procedure
    .input(customer_create_return_request_dto)
    .mutation(({ ctx, input }) =>
      return_service.customer_create_request({
        ...input,
        user_id: ctx.session!.user.id,
      }),
    ),

  myListReturnRequests: storefront_procedure
    .input(list_return_requests_dto)
    .query(({ ctx, input }) =>
      return_service.customer_list_by_order(input.order_id, ctx.session!.user.id),
    ),

  // Admin procedures
  adminList: permission_procedure(PERMISSIONS.orders_read)
    .input(admin_list_return_requests_dto)
    .query(({ input }) => return_service.admin_list(input)),

  adminGet: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ id: z.string().min(1).max(255) }))
    .query(({ input }) => return_service.get_request(input.id)),

  adminListByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(list_return_requests_dto)
    .query(({ input }) => return_service.list_by_order(input.order_id)),

  adminCreate: permission_procedure(PERMISSIONS.orders_write)
    .input(create_return_request_dto)
    .mutation(({ ctx, input }) =>
      return_service.create_request({
        ...input,
        requested_by_user_id: ctx.session!.user.id,
      }),
    ),

  adminReview: permission_procedure(PERMISSIONS.orders_write)
    .input(review_return_request_dto)
    .mutation(({ ctx, input }) =>
      return_service.review_request({
        ...input,
        reviewed_by_user_id: ctx.session!.user.id,
      }),
    ),

  adminReceive: permission_procedure(PERMISSIONS.orders_write)
    .input(receive_return_dto)
    .mutation(({ ctx, input }) =>
      return_service.receive_items({
        ...input,
        user_id: ctx.session!.user.id,
      }),
    ),

  adminComplete: permission_procedure(PERMISSIONS.orders_write)
    .input(complete_return_dto)
    .mutation(({ ctx, input }) =>
      return_service.complete_request({
        ...input,
        user_id: ctx.session!.user.id,
      }),
    ),

  adminCancel: permission_procedure(PERMISSIONS.orders_write)
    .input(cancel_return_request_dto)
    .mutation(({ ctx, input }) =>
      return_service.cancel_request({
        ...input,
        user_id: ctx.session!.user.id,
      }),
    ),
});
