import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { order_operations_service } from "../services/order-operations.service";

export const order_operations_router = create_trpc_router({
  orderAssignOperator: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), operator_id: z.string(), note: z.string().optional() }))
    .mutation(({ ctx, input }) => order_operations_service.assign_operator({ ...input, actor_user_id: ctx.session!.user.id })),

  orderGetAssignmentHistory: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_assignment_history(input.order_id)),

  orderEscalate: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), reason: z.string(), description: z.string().optional(), priority: z.enum(["low", "normal", "high", "urgent"]).optional(), assigned_to_user_id: z.string().optional() }))
    .mutation(({ ctx, input }) => order_operations_service.escalate({ ...input, escalated_by_user_id: ctx.session!.user.id })),

  orderResolveEscalation: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), resolution: z.string(), status: z.enum(["resolved", "dismissed"]).optional() }))
    .mutation(({ ctx, input }) => order_operations_service.resolve_escalation({ ...input, resolved_by_user_id: ctx.session!.user.id })),

  orderGetEscalations: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_escalations(input.order_id)),

  orderListEscalations: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => order_operations_service.list_escalations(input.page, input.limit, input.status)),

  orderPlaceOnHold: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), reason: z.string(), description: z.string().optional() }))
    .mutation(({ ctx, input }) => order_operations_service.place_on_hold({ ...input, held_by_user_id: ctx.session!.user.id })),

  orderReleaseHold: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ hold_id: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) => order_operations_service.release_hold({ ...input, released_by_user_id: ctx.session!.user.id })),

  orderGetHolds: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_holds(input.order_id)),

  orderRequestCancellation: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), reason: z.string(), description: z.string().optional() }))
    .mutation(({ ctx, input }) => order_operations_service.request_cancellation({ ...input, requested_by_user_id: ctx.session!.user.id })),

  orderReviewCancellation: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ cancellation_request_id: z.string(), status: z.enum(["approved", "rejected"]), review_note: z.string().optional(), refund_amount: z.coerce.number().optional() }))
    .mutation(({ ctx, input }) => order_operations_service.review_cancellation({ ...input, reviewed_by_user_id: ctx.session!.user.id })),

  orderGetCancellationRequests: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_cancellation_requests(input.order_id)),

  orderListCancellationRequests: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => order_operations_service.list_cancellation_requests(input.page, input.limit, input.status)),

  orderAddComment: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), content: z.string().min(1).max(4096), is_private: z.boolean().default(true) }))
    .mutation(({ ctx, input }) => order_operations_service.add_comment({ ...input, author_user_id: ctx.session!.user.id })),

  orderGetComments: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string(), include_private: z.boolean().default(true) }))
    .query(({ input }) => order_operations_service.get_comments(input.order_id, input.include_private)),

  orderGetTimeline: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_timeline(input.order_id)),
});
