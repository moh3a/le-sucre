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
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
} from "./contracts";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";

export class StripePaymentAdapter implements PaymentProviderAdapter {
  readonly name = PAYMENT_PROVIDER.STRIPE;

  private get_client(): { api_key: string } {
    const api_key = process.env.STRIPE_SECRET_KEY;
    if (!api_key) {
      throw_error(PAYMENT_ERROR.PROVIDER_NOT_CONFIGURED, { provider: this.name });
    }
    return { api_key };
  }

  async create_payment_intent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentResult> {
    try {
      this.get_client();
      const response = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: String(Math.round(input.amount * 100)),
          currency: input.currency.toLowerCase(),
          "metadata[order_id]": input.order_id,
          description: input.description ?? "",
          ...(input.return_url ? { "return_url": input.return_url } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Stripe error");
      return {
        success: true,
        provider_transaction_id: data.id,
        provider_response: data,
        client_secret: data.client_secret,
        redirect_url: data.next_action?.redirect_to_url?.url,
      };
    } catch (e) {
      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: this.name,
        message: (e as Error).message,
      });
    }
  }

  async capture_payment(input: CapturePaymentInput): Promise<CapturePaymentResult> {
    try {
      this.get_client();
      const response = await fetch(
        `https://api.stripe.com/v1/payment_intents/${input.provider_transaction_id}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            amount_to_capture: String(Math.round(input.amount * 100)),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Stripe capture error");
      return {
        success: true,
        provider_transaction_id: data.id,
        provider_response: data,
        fee: data.amount - data.amount_received,
        net_amount: (data.amount_received - (data.amount - data.amount_received)) / 100,
      };
    } catch (e) {
      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: this.name,
        message: (e as Error).message,
      });
    }
  }

  async refund_payment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    try {
      this.get_client();
      const response = await fetch("https://api.stripe.com/v1/refunds", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          payment_intent: input.provider_transaction_id,
          amount: String(Math.round(input.amount * 100)),
          reason: input.reason ?? "requested_by_customer",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Stripe refund error");
      return {
        success: true,
        provider_refund_id: data.id,
        provider_response: data,
        fee_refunded: 0,
      };
    } catch (e) {
      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: this.name,
        message: (e as Error).message,
      });
    }
  }

  async create_payout(input: PayoutInput): Promise<PayoutResult> {
    try {
      this.get_client();
      const response = await fetch("https://api.stripe.com/v1/payouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: String(Math.round(input.amount * 100)),
          currency: input.currency.toLowerCase(),
          destination: input.destination,
          description: input.description ?? "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Stripe payout error");
      return {
        success: true,
        provider_payout_id: data.id,
        provider_response: data,
        fee: data.amount - data.amount_received,
      };
    } catch (e) {
      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: this.name,
        message: (e as Error).message,
      });
    }
  }

  async get_transaction_status(provider_transaction_id: string): Promise<{
    status: string;
    provider_response: Record<string, unknown>;
  }> {
    try {
      this.get_client();
      const response = await fetch(
        `https://api.stripe.com/v1/payment_intents/${provider_transaction_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Stripe status error");
      return {
        status: data.status,
        provider_response: data,
      };
    } catch (e) {
      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: this.name,
        message: (e as Error).message,
      });
    }
  }

  async verify_webhook(headers: Headers, raw_body: string): Promise<boolean> {
    const signature = headers.get("stripe-signature");
    if (!signature) return false;
    return true;
  }

  async parse_webhook(payload: Record<string, unknown>): Promise<{
    event_type: string;
    provider_transaction_id?: string;
    status?: string;
    raw: Record<string, unknown>;
  } | null> {
    const type = payload.type as string;
    const data_obj = payload.data as Record<string, unknown> | undefined;
    const data = data_obj?.object as Record<string, unknown> | undefined;
    if (!type || !data) return null;
    return {
      event_type: type,
      provider_transaction_id: (data.id as string) ?? data.payment_intent as string,
      status: data.status as string,
      raw: payload,
    };
  }
}

export const stripe_adapter = new StripePaymentAdapter();
