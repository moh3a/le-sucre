import "server-only";
import { payment_repository } from "../repositories/payment.repository";
import { payment_audit_service } from "./payment-audit.service";
import { PAYMENT_TRANSACTION_STATUS, AUDIT_ACTION } from "../constants/payment-status";

export class PaymentRetryService {
  constructor(private readonly repo = payment_repository) {}

  async find_failed_payments_for_retry(max_retries = 3) {
    const all = await this.repo.list_transactions(1, 1000, {
      status: PAYMENT_TRANSACTION_STATUS.FAILED,
    });
    return all.items.filter(
      (t) => t.retry_count < max_retries,
    );
  }

  async find_stuck_payments(hours_threshold = 2) {
    const all = await this.repo.list_transactions(1, 1000, {
      status: PAYMENT_TRANSACTION_STATUS.PROCESSING,
    });
    const threshold = new Date(Date.now() - hours_threshold * 60 * 60 * 1000).toISOString();
    return all.items.filter((t) => t.created_at < threshold);
  }

  async find_expired_pending_payments(hours_threshold = 24) {
    const all = await this.repo.list_transactions(1, 1000, {
      status: PAYMENT_TRANSACTION_STATUS.PENDING,
    });
    const threshold = new Date(Date.now() - hours_threshold * 60 * 60 * 1000).toISOString();
    return all.items.filter((t) => t.created_at < threshold);
  }

  async retry_all_failed(max_retries = 3) {
    const failed = await this.find_failed_payments_for_retry(max_retries);
    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const payment of failed) {
      try {
        await this.repo.update_transaction(payment.id, {
          status: PAYMENT_TRANSACTION_STATUS.PENDING,
          failure_reason: null,
          failed_at: null,
          retry_count: payment.retry_count + 1,
        });

        await payment_audit_service.log({
          transaction_id: payment.id,
          order_id: payment.order_id,
          action: AUDIT_ACTION.PAYMENT_RETRIED,
          resource_type: "payment_transaction",
          resource_id: payment.id,
          from_status: PAYMENT_TRANSACTION_STATUS.FAILED,
          to_status: PAYMENT_TRANSACTION_STATUS.PENDING,
          metadata: { retry_count: payment.retry_count + 1, auto_retry: true },
        });

        results.push({ id: payment.id, success: true });
      } catch (e) {
        results.push({ id: payment.id, success: false, error: (e as Error).message });
      }
    }

    return results;
  }

  async expire_stale_payments(hours_threshold = 24) {
    const stale = await this.find_expired_pending_payments(hours_threshold);
    const results: Array<{ id: string; success: boolean }> = [];

    for (const payment of stale) {
      await this.repo.update_transaction(payment.id, {
        status: PAYMENT_TRANSACTION_STATUS.EXPIRED,
      });

      await payment_audit_service.log({
        transaction_id: payment.id,
        order_id: payment.order_id,
        action: AUDIT_ACTION.PAYMENT_CANCELLED,
        resource_type: "payment_transaction",
        resource_id: payment.id,
        from_status: PAYMENT_TRANSACTION_STATUS.PENDING,
        to_status: PAYMENT_TRANSACTION_STATUS.EXPIRED,
        metadata: { reason: "Auto-expired after threshold" },
      });

      results.push({ id: payment.id, success: true });
    }

    return results;
  }
}

export const payment_retry_service = new PaymentRetryService();
