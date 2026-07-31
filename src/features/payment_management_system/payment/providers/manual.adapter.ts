import "server-only";
import { PAYMENT_PROVIDER } from "../constants/payment-status";
import type {
  PaymentProviderAdapter,
  CapturePaymentInput,
  CapturePaymentResult,
  RefundPaymentInput,
  RefundPaymentResult,
  PayoutInput,
  PayoutResult,
} from "./contracts";

export class ManualPaymentAdapter implements PaymentProviderAdapter {
  readonly name = PAYMENT_PROVIDER.MANUAL;

  async capture_payment(input: CapturePaymentInput): Promise<CapturePaymentResult> {
    return {
      success: true,
      provider_transaction_id: `manual_${Date.now()}`,
      provider_response: { captured_manually: true },
      fee: 0,
      net_amount: input.amount,
    };
  }

  async refund_payment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return {
      success: true,
      provider_refund_id: `manual_refund_${Date.now()}`,
      provider_response: { refunded_manually: true },
      fee_refunded: 0,
    };
  }

  async create_payout(input: PayoutInput): Promise<PayoutResult> {
    return {
      success: true,
      provider_payout_id: `manual_payout_${Date.now()}`,
      provider_response: { paid_manually: true },
      fee: 0,
    };
  }

  async get_transaction_status(provider_transaction_id: string): Promise<{
    status: string;
    provider_response: Record<string, unknown>;
  }> {
    return { status: "completed", provider_response: { manual: true } };
  }
}

export const manual_adapter = new ManualPaymentAdapter();
