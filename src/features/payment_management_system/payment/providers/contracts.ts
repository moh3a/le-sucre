import type { PAYMENT_PROVIDER } from "../constants/payment-status";

export type PaymentProviderName = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

export interface CapturePaymentInput {
  amount: number;
  currency: string;
  provider_transaction_id: string;
  metadata?: Record<string, unknown>;
}

export interface CapturePaymentResult {
  success: boolean;
  provider_transaction_id: string;
  provider_response: Record<string, unknown>;
  fee?: number;
  net_amount?: number;
}

export interface RefundPaymentInput {
  amount: number;
  currency: string;
  provider_transaction_id: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundPaymentResult {
  success: boolean;
  provider_refund_id: string;
  provider_response: Record<string, unknown>;
  fee_refunded?: number;
}

export interface PayoutInput {
  amount: number;
  currency: string;
  destination: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PayoutResult {
  success: boolean;
  provider_payout_id: string;
  provider_response: Record<string, unknown>;
  fee?: number;
}

export interface PaymentProviderAdapter {
  readonly name: PaymentProviderName;

  capture_payment(input: CapturePaymentInput): Promise<CapturePaymentResult>;

  refund_payment(input: RefundPaymentInput): Promise<RefundPaymentResult>;

  create_payout(input: PayoutInput): Promise<PayoutResult>;

  get_transaction_status(provider_transaction_id: string): Promise<{
    status: string;
    provider_response: Record<string, unknown>;
  }>;

  verify_webhook?(headers: Headers, raw_body: string): Promise<boolean>;

  parse_webhook?(payload: Record<string, unknown>): Promise<{
    event_type: string;
    provider_transaction_id?: string;
    status?: string;
    raw: Record<string, unknown>;
  } | null>;
}

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  order_id: string;
  description?: string;
  metadata?: Record<string, unknown>;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  return_url?: string;
  cancel_url?: string;
}

export interface CreatePaymentIntentResult {
  success: boolean;
  provider_transaction_id: string;
  provider_response: Record<string, unknown>;
  redirect_url?: string;
  client_secret?: string;
}
