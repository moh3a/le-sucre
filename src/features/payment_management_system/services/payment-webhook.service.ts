import "server-only";
import { payment_repository } from "../repositories/payment.repository";
import { payment_audit_service } from "./payment-audit.service";
import { payment_processing_service } from "./payment-processing.service";
import { get_payment_provider } from "../providers/provider-registry";
import { PAYMENT_TRANSACTION_STATUS, AUDIT_ACTION } from "../constants/payment-status";
import type { PaymentProviderName } from "../providers/contracts";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";

export class PaymentWebhookService {
  constructor(private readonly repo = payment_repository) {}

  async handle_provider_webhook(
    provider: PaymentProviderName,
    headers: Headers,
    raw_body: string,
  ) {
    const adapter = get_payment_provider(provider);

    if (adapter.verify_webhook) {
      const is_valid = await adapter.verify_webhook(headers, raw_body);
      if (!is_valid) {
        throw_error(PAYMENT_ERROR.INVALID_WEBHOOK_SIGNATURE, { provider });
      }
    }

    let parsed_body: Record<string, unknown>;
    try {
      parsed_body = JSON.parse(raw_body);
    } catch {
      throw_error(PAYMENT_ERROR.WEBHOOK_PROCESSING_FAILED, {
        message: "Invalid JSON body",
      });
    }

    await payment_audit_service.log({
      action: AUDIT_ACTION.WEBHOOK_RECEIVED,
      resource_type: "webhook",
      resource_id: `${provider}_${Date.now()}`,
      metadata: { provider, event_type: (parsed_body.type ?? parsed_body.event_type) as string },
    });

    if (!adapter.parse_webhook) {
      return { received: true };
    }

    const event = await adapter.parse_webhook(parsed_body);
    if (!event) {
      return { received: true };
    }

    try {
      await this.process_webhook_event(provider, event);
    } catch (e) {
      await payment_audit_service.log({
        action: AUDIT_ACTION.WEBHOOK_PROCESSED,
        resource_type: "webhook",
        resource_id: `${provider}_${event.provider_transaction_id ?? Date.now()}`,
        metadata: {
          provider,
          event_type: event.event_type,
          error: (e as Error).message,
        },
      });
      throw e;
    }

    await payment_audit_service.log({
      action: AUDIT_ACTION.WEBHOOK_PROCESSED,
      resource_type: "webhook",
      resource_id: `${provider}_${event.provider_transaction_id ?? Date.now()}`,
      metadata: { provider, event_type: event.event_type, transaction_id: event.provider_transaction_id },
    });

    return { received: true, event };
  }

  private async process_webhook_event(
    provider: PaymentProviderName,
    event: {
      event_type: string;
      provider_transaction_id?: string;
      status?: string;
      raw: Record<string, unknown>;
    },
  ) {
    if (!event.provider_transaction_id) return;

    const transaction = await this.repo.find_transaction_by_provider_ref(
      provider,
      event.provider_transaction_id,
    );

    if (!transaction) return;

    switch (event.event_type) {
      case "payment_intent.succeeded":
      case "CHECKOUT.ORDER.APPROVED":
      case "PAYMENT.CAPTURE.COMPLETED":
        if (transaction.status === PAYMENT_TRANSACTION_STATUS.PENDING) {
          await payment_processing_service.mark_completed({
            transaction_id: transaction.id,
            provider_transaction_id: event.provider_transaction_id,
            provider_response: event.raw,
          });
        }
        break;

      case "payment_intent.payment_failed":
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED":
        await payment_processing_service.fail({
          transaction_id: transaction.id,
          reason: event.event_type,
          failure_code: "webhook",
        });
        break;

      case "payment_intent.canceled":
        await payment_processing_service.cancel({
          transaction_id: transaction.id,
          reason: `Cancelled via webhook: ${event.event_type}`,
        });
        break;
    }
  }
}

export const payment_webhook_service = new PaymentWebhookService();
