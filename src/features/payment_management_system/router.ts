import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import type { PaymentProviderName } from "./providers/contracts";
import { payment_processing_service } from "./services/payment-processing.service";
import { payment_refund_service } from "./services/payment-refund.service";
import { partial_payment_service } from "./services/partial-payment.service";
import { split_payment_service } from "./services/split-payment.service";
import { payment_audit_service } from "./services/payment-audit.service";
import { payment_retry_service } from "./services/payment-retry.service";
import {
  list_payments_dto,
  process_payment_dto,
  capture_payment_dto,
  cancel_payment_dto,
  retry_payment_dto,
  create_partial_payment_dto,
  pay_installment_dto,
  create_refund_dto,
  approve_refund_dto,
  reject_refund_dto,
  process_refund_dto,
  list_refunds_dto,
  create_payout_dto,
  list_payouts_dto,
  process_payout_dto,
  list_audit_logs_dto,
  sync_provider_status_dto,
} from "./models/payment.dto";

export const payment_router = create_trpc_router({
  // ─── Customer endpoints ────────────────────────────────
  myTransactions: storefront_procedure
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ ctx, input }) =>
      payment_processing_service.get_for_customer(ctx.session!.user.id, input.page, input.limit),
    ),

  myOrderTransactions: storefront_procedure
    .input(z.object({ order_id: z.string().min(1).max(255) }))
    .query(({ ctx, input }) =>
      payment_processing_service.get_for_order(input.order_id),
    ),

  myPaymentById: storefront_procedure
    .input(z.object({ payment_id: z.string().min(1).max(255) }))
    .query(({ ctx, input }) =>
      payment_processing_service.get_by_id(input.payment_id),
    ),

  // ─── Admin: Payments ───────────────────────────────────
  adminList: permission_procedure(PERMISSIONS.orders_read)
    .input(list_payments_dto)
    .query(({ input }) => payment_processing_service.list(input.page, input.limit, input)),

  adminGet: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ transaction_id: z.string().min(1).max(255) }))
    .query(({ input }) => payment_processing_service.get_by_id(input.transaction_id)),

  adminStats: permission_procedure(PERMISSIONS.orders_read).query(() =>
    payment_processing_service.get_stats(),
  ),

  adminCharts: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ days: z.coerce.number().int().min(7).max(365).default(30) }).optional())
    .query(({ input }) => payment_processing_service.get_charts(input?.days)),

  adminProcess: permission_procedure(PERMISSIONS.orders_write)
    .input(process_payment_dto)
    .mutation(({ ctx, input }) =>
      payment_processing_service.process({
        ...input,
        provider: input.provider as PaymentProviderName,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminCapture: permission_procedure(PERMISSIONS.orders_write)
    .input(capture_payment_dto)
    .mutation(({ ctx, input }) =>
      payment_processing_service.capture({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminCancel: permission_procedure(PERMISSIONS.orders_write)
    .input(cancel_payment_dto)
    .mutation(({ ctx, input }) =>
      payment_processing_service.cancel({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminRetry: permission_procedure(PERMISSIONS.orders_write)
    .input(retry_payment_dto)
    .mutation(({ ctx, input }) =>
      payment_processing_service.retry({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminSyncProviderStatus: permission_procedure(PERMISSIONS.orders_read)
    .input(sync_provider_status_dto)
    .mutation(({ input }) =>
      payment_processing_service.sync_provider_status(input.transaction_id),
    ),

  adminOrderTransactions: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string().min(1).max(255) }))
    .query(({ input }) => payment_processing_service.get_for_order(input.order_id)),

  // ─── Admin: Partial Payments ──────────────────────────
  adminCreateDeposit: permission_procedure(PERMISSIONS.orders_write)
    .input(create_partial_payment_dto)
    .mutation(({ ctx, input }) =>
      partial_payment_service.create_deposit({
        order_id: input.order_id,
        provider: input.provider as PaymentProviderName,
        deposit_percentage: input.deposit_percentage ?? 50,
        currency: input.currency,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminCreateInstallments: permission_procedure(PERMISSIONS.orders_write)
    .input(create_partial_payment_dto)
    .mutation(({ ctx, input }) =>
      partial_payment_service.create_installment_plan({
        order_id: input.order_id,
        provider: input.provider as PaymentProviderName,
        total_installments: input.total_installments ?? 3,
        currency: input.currency,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminPayInstallment: permission_procedure(PERMISSIONS.orders_write)
    .input(pay_installment_dto)
    .mutation(({ input }) =>
      partial_payment_service.mark_installment_paid(input.installment_id, input.provider as PaymentProviderName),
    ),

  adminInstallments: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string().min(1).max(255) }))
    .query(({ input }) => partial_payment_service.get_installment_plan(input.order_id)),

  // ─── Admin: Refunds ───────────────────────────────────
  adminCreateRefund: permission_procedure(PERMISSIONS.refund_write)
    .input(create_refund_dto)
    .mutation(({ ctx, input }) =>
      payment_refund_service.create_refund({
        ...input,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminApproveRefund: permission_procedure(PERMISSIONS.refund_write)
    .input(approve_refund_dto)
    .mutation(({ ctx, input }) =>
      payment_refund_service.approve_refund(input.refund_id, ctx.session!.user.id),
    ),

  adminRejectRefund: permission_procedure(PERMISSIONS.refund_write)
    .input(reject_refund_dto)
    .mutation(({ ctx, input }) =>
      payment_refund_service.reject_refund(input.refund_id, input.reason, ctx.session!.user.id),
    ),

  adminProcessRefund: permission_procedure(PERMISSIONS.refund_write)
    .input(process_refund_dto)
    .mutation(({ ctx, input }) =>
      payment_refund_service.process_refund(input.refund_id, ctx.session!.user.id),
    ),

  adminListRefunds: permission_procedure(PERMISSIONS.refund_read)
    .input(list_refunds_dto)
    .query(({ input }) => payment_refund_service.list_refunds(input.page, input.limit, input)),

  adminRefundStats: permission_procedure(PERMISSIONS.refund_read).query(() =>
    payment_refund_service.get_refund_stats(),
  ),

  adminGetRefund: permission_procedure(PERMISSIONS.refund_read)
    .input(z.object({ refund_id: z.string().min(1).max(255) }))
    .query(({ input }) => payment_refund_service.get_refund(input.refund_id)),

  adminTransactionRefunds: permission_procedure(PERMISSIONS.refund_read)
    .input(z.object({ transaction_id: z.string().min(1).max(255) }))
    .query(({ input }) => payment_refund_service.get_refunds_for_transaction(input.transaction_id)),

  // ─── Admin: Payouts ───────────────────────────────────
  adminCreatePayout: permission_procedure(PERMISSIONS.orders_write)
    .input(create_payout_dto)
    .mutation(({ ctx, input }) =>
      split_payment_service.create_vendor_payout({
        vendor_id: input.vendor_id,
        gross_amount: input.amount,
        commission_rate: input.commission_rate,
        currency: input.currency,
        description: input.description,
        payout_method: input.payout_method,
        metadata: input.metadata,
        actor_user_id: ctx.session!.user.id,
      }),
    ),

  adminListPayouts: permission_procedure(PERMISSIONS.orders_read)
    .input(list_payouts_dto)
    .query(({ input }) => split_payment_service.list_payouts(input.page, input.limit, input)),

  adminPayoutStats: permission_procedure(PERMISSIONS.orders_read).query(() =>
    split_payment_service.get_payout_stats(),
  ),

  adminGetPayout: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ payout_id: z.string().min(1).max(255) }))
    .query(({ input }) => split_payment_service.get_payout(input.payout_id)),

  adminProcessPayout: permission_procedure(PERMISSIONS.orders_write)
    .input(process_payout_dto)
    .mutation(({ ctx, input }) =>
      split_payment_service.process_payout(input.payout_id, {}, ctx.session!.user.id),
    ),

  adminCompletePayout: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ payout_id: z.string().min(1).max(255) }))
    .mutation(({ ctx, input }) =>
      split_payment_service.complete_payout(input.payout_id, undefined, {}, ctx.session!.user.id),
    ),

  // ─── Admin: Audit Logs ────────────────────────────────
  adminAuditLogs: permission_procedure(PERMISSIONS.audit_read)
    .input(list_audit_logs_dto)
    .query(({ input }) => payment_audit_service.list(input.page, input.limit, input)),

  // ─── Admin: Retry Management ──────────────────────────
  adminRetryFailed: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ max_retries: z.coerce.number().int().min(1).max(10).default(3) }).optional())
    .mutation(({ input }) => payment_retry_service.retry_all_failed(input?.max_retries)),
});
