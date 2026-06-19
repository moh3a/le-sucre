import type {
  PaymentTransactionStatus,
  PaymentTransactionType,
  RefundStatus,
  RefundType,
  PayoutStatus,
  PayoutType,
  PaymentProvider,
  PartialPaymentType,
  PartialPaymentStatus,
  AuditAction,
} from "../constants/payment-status";

export interface PaymentTransaction {
  id: string;
  order_id: string;
  user_id: string | null;
  invoice_id: string | null;
  provider: PaymentProvider;
  provider_transaction_id: string | null;
  provider_payment_method: string | null;
  provider_response: Record<string, unknown>;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  currency: string;
  amount: string;
  fee: string;
  net_amount: string;
  refunded_amount: string;
  failure_reason: string | null;
  failure_code: string | null;
  retry_count: number;
  max_retries: number;
  idempotency_key: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  captured_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentPartial {
  id: string;
  transaction_id: string;
  order_id: string;
  type: PartialPaymentType;
  status: PartialPaymentStatus;
  installment_number: number | null;
  total_installments: number | null;
  percentage: string;
  amount: string;
  paid_amount: string;
  remaining_amount: string;
  due_at: string;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentRefund {
  id: string;
  transaction_id: string;
  order_id: string;
  user_id: string | null;
  invoice_id: string | null;
  provider_refund_id: string | null;
  provider_response: Record<string, unknown>;
  type: RefundType;
  status: RefundStatus;
  reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  currency: string;
  amount: string;
  fee_refunded: string;
  net_refunded: string;
  sku_refunds: Array<{ sku_id: string; quantity: number; amount: string }>;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentPayout {
  id: string;
  vendor_id: string | null;
  transaction_id: string | null;
  order_id: string | null;
  type: PayoutType;
  status: PayoutStatus;
  currency: string;
  gross_amount: string;
  commission_amount: string;
  commission_rate: string;
  net_amount: string;
  fee: string;
  payout_method: string | null;
  payout_reference: string | null;
  provider_response: Record<string, unknown>;
  description: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  processed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentAuditLog {
  id: string;
  transaction_id: string | null;
  refund_id: string | null;
  payout_id: string | null;
  order_id: string | null;
  actor_user_id: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  from_status: string | null;
  to_status: string | null;
  changes: Record<string, unknown>;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PaymentStats {
  total_revenue: number;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_refunds: number;
  refund_amount: number;
  total_fees: number;
  net_revenue: number;
  pending_transactions: number;
  processing_transactions: number;
  average_transaction_value: number;
  period_revenue: number;
  period_transactions: number;
  period_refunds: number;
  previous_period_revenue: number;
  previous_period_transactions: number;
  revenue_growth: number;
  transaction_growth: number;
}

export interface PaymentCharts {
  daily_revenue: Array<{ date: string; revenue: number; fees: number; refunds: number }>;
  weekly_revenue: Array<{ week: string; revenue: number; count: number }>;
  payment_methods: Array<{ provider: string; count: number; total: number }>;
  status_distribution: Array<{ status: string; count: number }>;
}

export interface PaymentWithRelations extends PaymentTransaction {
  user?: { id: string; name: string; email: string } | null;
  order?: { id: string; order_number: string } | null;
  partials?: PaymentPartial[];
  refunds?: PaymentRefund[];
  payouts?: PaymentPayout[];
  audit_logs?: PaymentAuditLog[];
}

export interface RefundWithRelations extends PaymentRefund {
  transaction?: PaymentTransaction | null;
  user?: { id: string; name: string; email: string } | null;
  approver?: { id: string; name: string; email: string } | null;
}

export interface PayoutWithRelations extends PaymentPayout {
  items?: Array<{
    id: string;
    sku_id: string;
    product_name: string;
    quantity: number;
    net_amount: string;
  }>;
}
