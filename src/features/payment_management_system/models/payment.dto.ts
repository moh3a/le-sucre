import { z } from "zod";
import {
  PAYMENT_TRANSACTION_STATUS,
  PAYMENT_TRANSACTION_TYPE,
  REFUND_STATUS,
  REFUND_TYPE,
  PAYOUT_STATUS,
  PAYOUT_TYPE,
  PAYMENT_PROVIDER,
  PARTIAL_PAYMENT_TYPE,
} from "../constants/payment-status";

export const list_payments_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(PAYMENT_TRANSACTION_STATUS) as [string, ...string[]]).optional(),
  type: z.enum(Object.values(PAYMENT_TRANSACTION_TYPE) as [string, ...string[]]).optional(),
  provider: z.enum(Object.values(PAYMENT_PROVIDER) as [string, ...string[]]).optional(),
  order_id: z.string().optional(),
  user_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().max(255).optional(),
});

export const process_payment_dto = z.object({
  order_id: z.string().min(1).max(255),
  provider: z.enum(Object.values(PAYMENT_PROVIDER) as [string, ...string[]]),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default("DZD"),
  description: z.string().max(500).optional(),
  idempotency_key: z.string().max(128).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  return_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

export const capture_payment_dto = z.object({
  transaction_id: z.string().min(1).max(255),
  amount: z.coerce.number().positive().optional(),
});

export const cancel_payment_dto = z.object({
  transaction_id: z.string().min(1).max(255),
  reason: z.string().max(500).optional(),
});

export const retry_payment_dto = z.object({
  transaction_id: z.string().min(1).max(255),
});

export const create_partial_payment_dto = z.object({
  order_id: z.string().min(1).max(255),
  type: z.enum([PARTIAL_PAYMENT_TYPE.DEPOSIT, PARTIAL_PAYMENT_TYPE.INSTALLMENT]),
  provider: z.enum(Object.values(PAYMENT_PROVIDER) as [string, ...string[]]),
  deposit_percentage: z.coerce.number().min(1).max(100).optional(),
  total_installments: z.coerce.number().int().min(2).max(36).optional(),
  currency: z.string().length(3).default("DZD"),
});

export const pay_installment_dto = z.object({
  installment_id: z.string().min(1).max(255),
  provider: z.enum(Object.values(PAYMENT_PROVIDER) as [string, ...string[]]),
});

export const create_refund_dto = z.object({
  transaction_id: z.string().min(1).max(255),
  type: z.enum([REFUND_TYPE.FULL, REFUND_TYPE.PARTIAL, REFUND_TYPE.SKU_LEVEL]),
  amount: z.coerce.number().positive().optional(),
  reason: z.string().max(1000).optional(),
  require_approval: z.boolean().default(false),
  sku_refunds: z
    .array(
      z.object({
        sku_id: z.string().min(1).max(255),
        quantity: z.number().int().positive(),
        amount: z.string(),
      }),
    )
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const approve_refund_dto = z.object({
  refund_id: z.string().min(1).max(255),
});

export const reject_refund_dto = z.object({
  refund_id: z.string().min(1).max(255),
  reason: z.string().max(500),
});

export const process_refund_dto = z.object({
  refund_id: z.string().min(1).max(255),
});

export const list_refunds_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(REFUND_STATUS) as [string, ...string[]]).optional(),
  type: z.enum(Object.values(REFUND_TYPE) as [string, ...string[]]).optional(),
  transaction_id: z.string().optional(),
  order_id: z.string().optional(),
});

export const create_payout_dto = z.object({
  vendor_id: z.string().min(1).max(255),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default("DZD"),
  commission_rate: z.coerce.number().min(0).max(100).default(0),
  description: z.string().max(500).optional(),
  payout_method: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const list_payouts_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(PAYOUT_STATUS) as [string, ...string[]]).optional(),
  vendor_id: z.string().optional(),
});

export const process_payout_dto = z.object({
  payout_id: z.string().min(1).max(255),
});

export const list_audit_logs_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  transaction_id: z.string().optional(),
  refund_id: z.string().optional(),
  action: z.string().optional(),
  resource_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const sync_provider_status_dto = z.object({
  transaction_id: z.string().min(1).max(255),
});
