import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { payment_operations_service } from "../services/payment-operations.service";

export const payment_operations_router = create_trpc_router({
  paymentCreateVerification: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), amount: z.coerce.number(), currency: z.string().optional(), reference_number: z.string().optional(), proof_url: z.string().optional(), notes: z.string().optional() }))
    .mutation(({ ctx, input }) => payment_operations_service.create_verification({ ...input, created_by_user_id: ctx.session!.user.id })),

  paymentVerify: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), status: z.enum(["verified", "rejected"]), rejection_reason: z.string().optional() }))
    .mutation(({ ctx, input }) => payment_operations_service.verify_payment({ ...input, verified_by_user_id: ctx.session!.user.id })),

  paymentListVerifications: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => payment_operations_service.list_verifications(input.page, input.limit, input.status)),

  paymentCountPendingVerifications: permission_procedure(PERMISSIONS.orders_read)
    .query(() => payment_operations_service.count_pending()),

  paymentRequestRefund: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), amount: z.coerce.number(), reason: z.string(), return_request_id: z.string().optional(), cancellation_request_id: z.string().optional() }))
    .mutation(({ ctx, input }) => payment_operations_service.request_refund({ ...input, requested_by_user_id: ctx.session!.user.id })),

  paymentApproveRefund: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), refund_method: z.string().optional() }))
    .mutation(({ ctx, input }) => payment_operations_service.approve_refund({ ...input, approved_by_user_id: ctx.session!.user.id })),

  paymentProcessRefund: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), provider_reference: z.string().optional(), status: z.enum(["completed", "failed"]).optional() }))
    .mutation(({ ctx, input }) => payment_operations_service.process_refund({ ...input, processed_by_user_id: ctx.session!.user.id })),

  paymentListRefundRequests: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => payment_operations_service.list_refund_requests(input.page, input.limit, input.status)),

  paymentGetRefundByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => payment_operations_service.get_refund_by_order(input.order_id)),

  paymentRecordPartial: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), payment_number: z.coerce.number().int(), type: z.enum(["deposit", "installment", "balance"]), amount: z.coerce.number(), currency: z.string().optional(), payment_method: z.string().optional(), payment_reference: z.string().optional(), notes: z.string().optional() }))
    .mutation(({ input }) => payment_operations_service.record_partial_payment(input)),

  paymentGetPartialPayments: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => payment_operations_service.get_partial_payments(input.order_id)),

  paymentCheckDeposit: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => payment_operations_service.check_deposit_completed(input.order_id)),
});
