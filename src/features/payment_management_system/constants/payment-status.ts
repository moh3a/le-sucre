import z from "zod";

export const PAYMENT_TRANSACTION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  CAPTURED: "captured",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  ON_HOLD: "on_hold",
} as const;

export type PaymentTransactionStatus =
  (typeof PAYMENT_TRANSACTION_STATUS)[keyof typeof PAYMENT_TRANSACTION_STATUS];

export const PAYMENT_TRANSACTION_TYPE = {
  FULL: "full",
  DEPOSIT: "deposit",
  INSTALLMENT: "installment",
  PARTIAL: "partial",
  SPLIT: "split",
} as const;

export type PaymentTransactionType =
  (typeof PAYMENT_TRANSACTION_TYPE)[keyof typeof PAYMENT_TRANSACTION_TYPE];

export const REFUND_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export const REFUND_TYPE = {
  FULL: "full",
  PARTIAL: "partial",
  SKU_LEVEL: "sku_level",
} as const;

export type RefundType = (typeof REFUND_TYPE)[keyof typeof REFUND_TYPE];

export const PARTIAL_PAYMENT_TYPE = {
  DEPOSIT: "deposit",
  INSTALLMENT: "installment",
} as const;

export type PartialPaymentType = (typeof PARTIAL_PAYMENT_TYPE)[keyof typeof PARTIAL_PAYMENT_TYPE];

export const PARTIAL_PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export type PartialPaymentStatus =
  (typeof PARTIAL_PAYMENT_STATUS)[keyof typeof PARTIAL_PAYMENT_STATUS];

export const PAYOUT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type PayoutStatus = (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];

export const PAYOUT_TYPE = {
  VENDOR_PAYOUT: "vendor_payout",
  COMMISSION: "commission",
  REFUND: "refund",
  SETTLEMENT: "settlement",
} as const;

export type PayoutType = (typeof PAYOUT_TYPE)[keyof typeof PAYOUT_TYPE];

export const PAYMENT_PROVIDER = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
  CHARGILY: "chargily",
  SATIM: "satim",
  CIB: "cib",
  MANUAL: "manual",
} as const;

export const paymentProviders = ["stripe", "paypal", "chargily", "satim", "cib", "manual"] as const;
export const paymentProvidersSchema = z.enum(paymentProviders);
export type PaymentProvider = z.infer<typeof paymentProvidersSchema>;

export const AUDIT_ACTION = {
  PAYMENT_CREATED: "payment.created",
  PAYMENT_CAPTURED: "payment.captured",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_REFUNDED: "payment.refunded",
  PAYMENT_PARTIALLY_REFUNDED: "payment.partially_refunded",
  PAYMENT_CANCELLED: "payment.cancelled",
  PAYMENT_RETRIED: "payment.retried",
  REFUND_CREATED: "refund.created",
  REFUND_APPROVED: "refund.approved",
  REFUND_REJECTED: "refund.rejected",
  REFUND_PROCESSED: "refund.processed",
  REFUND_FAILED: "refund.failed",
  PARTIAL_PAYMENT_CREATED: "partial_payment.created",
  PARTIAL_PAYMENT_PAID: "partial_payment.paid",
  INSTALLMENT_PAID: "installment.paid",
  PAYOUT_CREATED: "payout.created",
  PAYOUT_PROCESSED: "payout.processed",
  PAYOUT_FAILED: "payout.failed",
  WEBHOOK_RECEIVED: "webhook.received",
  WEBHOOK_PROCESSED: "webhook.processed",
  PROVIDER_SYNC: "provider.sync",
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export const PAYMENT_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "failed", "cancelled", "on_hold"],
  processing: ["captured", "failed", "on_hold"],
  captured: ["completed", "partially_refunded", "refunded"],
  completed: ["partially_refunded", "refunded"],
  failed: ["pending", "processing"],
  on_hold: ["processing", "cancelled"],
  refunded: [],
  partially_refunded: ["refunded"],
  cancelled: [],
  expired: [],
} as const;
