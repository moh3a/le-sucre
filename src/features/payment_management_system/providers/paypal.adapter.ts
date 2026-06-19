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

export class PayPalPaymentAdapter implements PaymentProviderAdapter {
  readonly name = PAYMENT_PROVIDER.PAYPAL;

  private async get_access_token(): Promise<string> {
    const client_id = process.env.PAYPAL_CLIENT_ID;
    const client_secret = process.env.PAYPAL_CLIENT_SECRET;
    if (!client_id || !client_secret) {
      throw_error(PAYMENT_ERROR.PROVIDER_NOT_CONFIGURED, { provider: this.name });
    }
    const response = await fetch("https://api.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    const data = await response.json();
    return data.access_token;
  }

  async create_payment_intent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentResult> {
    try {
      const token = await this.get_access_token();
      const response = await fetch("https://api.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: input.order_id,
              amount: {
                currency_code: input.currency,
                value: String(input.amount.toFixed(2)),
              },
              description: input.description,
            },
          ],
          ...(input.return_url || input.cancel_url
            ? {
                payment_source: {
                  paypal: {
                    experience_context: {
                      return_url: input.return_url,
                      cancel_url: input.cancel_url,
                    },
                  },
                },
              }
            : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "PayPal error");
      return {
        success: true,
        provider_transaction_id: data.id,
        provider_response: data,
        redirect_url: data.links?.find((l: Record<string, string>) => l.rel === "payer-action")?.href,
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
      const token = await this.get_access_token();
      const response = await fetch(
        `https://api.paypal.com/v2/checkout/orders/${input.provider_transaction_id}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "PayPal capture error");
      return {
        success: true,
        provider_transaction_id: data.id,
        provider_response: data,
        fee: data.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.paypal_fee
          ? Number(data.purchase_units[0].payments.captures[0].seller_receivable_breakdown.paypal_fee.value)
          : 0,
        net_amount: data.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.net_amount
          ? Number(data.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.value)
          : 0,
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
      const token = await this.get_access_token();
      const response = await fetch(
        `https://api.paypal.com/v2/payments/captures/${input.provider_transaction_id}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: {
              currency_code: input.currency,
              value: String(input.amount.toFixed(2)),
            },
            note_to_payer: input.reason,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "PayPal refund error");
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
      const token = await this.get_access_token();
      const response = await fetch("https://api.paypal.com/v1/payments/payouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: `payout_${Date.now()}`,
            email_subject: input.description,
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: {
                value: String(input.amount.toFixed(2)),
                currency: input.currency,
              },
              receiver: input.destination,
              note: input.description,
            },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "PayPal payout error");
      return {
        success: true,
        provider_payout_id: data.batch_header?.payout_batch_id,
        provider_response: data,
        fee: 0,
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
      const token = await this.get_access_token();
      const response = await fetch(
        `https://api.paypal.com/v2/checkout/orders/${provider_transaction_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "PayPal status error");
      return { status: data.status, provider_response: data };
    } catch (e) {
      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: this.name,
        message: (e as Error).message,
      });
    }
  }

  async verify_webhook(headers: Headers, raw_body: string): Promise<boolean> {
    const webhook_id = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhook_id) return false;
    const transmission_id = headers.get("paypal-transmission-id");
    const transmission_sig = headers.get("paypal-transmission-sig");
    const cert_url = headers.get("paypal-cert-url");
    const auth_algo = headers.get("paypal-auth-algo");
    if (!transmission_id || !transmission_sig || !cert_url || !auth_algo) return false;
    return true;
  }

  async parse_webhook(payload: Record<string, unknown>): Promise<{
    event_type: string;
    provider_transaction_id?: string;
    status?: string;
    raw: Record<string, unknown>;
  } | null> {
    const event_type = payload.event_type as string;
    const resource = payload.resource as Record<string, unknown> | undefined;
    if (!event_type || !resource) return null;
    return {
      event_type,
      provider_transaction_id: (resource.id as string) ?? (resource.parent_payment as string),
      status: resource.status as string,
      raw: payload,
    };
  }
}

export const paypal_adapter = new PayPalPaymentAdapter();
