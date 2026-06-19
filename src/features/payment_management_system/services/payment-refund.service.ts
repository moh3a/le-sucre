import "server-only";
import { payment_repository } from "../repositories/payment.repository";
import { payment_audit_service } from "./payment-audit.service";
import { get_payment_provider } from "../providers/provider-registry";
import {
  PAYMENT_TRANSACTION_STATUS,
  REFUND_STATUS,
  REFUND_TYPE,
  AUDIT_ACTION,
} from "../constants/payment-status";
import type { PaymentProviderName, RefundPaymentInput } from "../providers/contracts";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";

export class PaymentRefundService {
  constructor(private readonly repo = payment_repository) {}

  async create_refund(input: {
    transaction_id: string;
    type: "full" | "partial" | "sku_level";
    amount?: number;
    reason?: string;
    require_approval?: boolean;
    sku_refunds?: Array<{ sku_id: string; quantity: number; amount: string }>;
    metadata?: Record<string, unknown>;
    actor_user_id?: string;
  }) {
    const transaction = await this.repo.find_transaction(input.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: input.transaction_id,
      });
    }

    if (
      transaction.status !== PAYMENT_TRANSACTION_STATUS.CAPTURED &&
      transaction.status !== PAYMENT_TRANSACTION_STATUS.COMPLETED &&
      transaction.status !== PAYMENT_TRANSACTION_STATUS.PARTIALLY_REFUNDED
    ) {
      throw_error(PAYMENT_ERROR.INVALID_STATUS_TRANSITION, {
        from: transaction.status,
        message: "Only captured or completed transactions can be refunded",
      });
    }

    const available_amount = Number(transaction.amount) - Number(transaction.refunded_amount);
    let refund_amount: number;

    if (input.type === REFUND_TYPE.FULL) {
      refund_amount = available_amount;
    } else if (input.type === REFUND_TYPE.PARTIAL) {
      refund_amount = input.amount ?? 0;
    } else {
      refund_amount = input.sku_refunds
        ? input.sku_refunds.reduce((sum, s) => sum + Number(s.amount), 0)
        : (input.amount ?? 0);
    }

    if (refund_amount <= 0 || refund_amount > available_amount) {
      throw_error(PAYMENT_ERROR.REFUND_EXCEEDS_AMOUNT, {
        requested: refund_amount,
        available: available_amount,
      });
    }

    const status = input.require_approval
      ? REFUND_STATUS.PENDING
      : REFUND_STATUS.APPROVED;

    const refund = await this.repo.create_refund({
      transaction_id: input.transaction_id,
      order_id: transaction.order_id,
      user_id: transaction.user_id,
      type: input.type,
      status,
      reason: input.reason ?? null,
      currency: transaction.currency,
      amount: String(refund_amount),
      fee_refunded: "0.00",
      net_refunded: String(refund_amount),
      sku_refunds: input.sku_refunds ?? [],
      metadata: input.metadata ?? {},
    });

    if (!input.require_approval) {
      await this.approve_refund(refund.id, input.actor_user_id);
    }

    await payment_audit_service.log({
      transaction_id: input.transaction_id,
      refund_id: refund.id,
      order_id: transaction.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.REFUND_CREATED,
      resource_type: "payment_refund",
      resource_id: refund.id,
      metadata: {
        type: input.type,
        amount: refund_amount,
        require_approval: input.require_approval,
      },
    });

    return refund;
  }

  async approve_refund(refund_id: string, approver_user_id?: string) {
    const refund = await this.repo.find_refund(refund_id);
    if (!refund) {
      throw_error(PAYMENT_ERROR.REFUND_NOT_FOUND, { refund_id });
    }

    if (refund.status === REFUND_STATUS.COMPLETED) {
      throw_error(PAYMENT_ERROR.REFUND_ALREADY_PROCESSED, { refund_id });
    }

    await this.repo.update_refund(refund_id, {
      status: REFUND_STATUS.APPROVED,
      approved_by: approver_user_id ?? null,
      approved_at: new Date().toISOString(),
    });

    await payment_audit_service.log({
      refund_id,
      transaction_id: refund.transaction_id,
      order_id: refund.order_id,
      actor_user_id: approver_user_id,
      action: AUDIT_ACTION.REFUND_APPROVED,
      resource_type: "payment_refund",
      resource_id: refund_id,
      from_status: refund.status,
      to_status: REFUND_STATUS.APPROVED,
    });
  }

  async reject_refund(refund_id: string, reason: string, actor_user_id?: string) {
    const refund = await this.repo.find_refund(refund_id);
    if (!refund) {
      throw_error(PAYMENT_ERROR.REFUND_NOT_FOUND, { refund_id });
    }

    await this.repo.update_refund(refund_id, {
      status: REFUND_STATUS.REJECTED,
      approved_by: actor_user_id ?? null,
      approved_at: new Date().toISOString(),
    });

    await payment_audit_service.log({
      refund_id,
      transaction_id: refund.transaction_id,
      order_id: refund.order_id,
      actor_user_id,
      action: AUDIT_ACTION.REFUND_REJECTED,
      resource_type: "payment_refund",
      resource_id: refund_id,
      from_status: refund.status,
      to_status: REFUND_STATUS.REJECTED,
      metadata: { reason },
    });
  }

  async process_refund(refund_id: string, actor_user_id?: string) {
    const refund = await this.repo.find_refund(refund_id);
    if (!refund) {
      throw_error(PAYMENT_ERROR.REFUND_NOT_FOUND, { refund_id });
    }

    if (refund.status !== REFUND_STATUS.APPROVED) {
      throw_error(PAYMENT_ERROR.REFUND_REQUIRES_APPROVAL, {
        refund_id,
        status: refund.status,
      });
    }

    const transaction = await this.repo.find_transaction(refund.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: refund.transaction_id,
      });
    }

    await this.repo.update_refund(refund_id, {
      status: REFUND_STATUS.PROCESSING,
    });

    const provider = get_payment_provider(transaction.provider as PaymentProviderName);
    const provider_transaction_id = transaction.provider_transaction_id ?? transaction.id;

    try {
      const result = await provider.refund_payment({
        amount: Number(refund.amount),
        currency: refund.currency,
        provider_transaction_id,
        reason: refund.reason ?? undefined,
        metadata: { refund_id },
      });

      const new_refunded_amount = (
        Number(transaction.refunded_amount) + Number(refund.amount)
      ).toFixed(2);

      const new_status =
        Number(new_refunded_amount) >= Number(transaction.amount)
          ? PAYMENT_TRANSACTION_STATUS.REFUNDED
          : PAYMENT_TRANSACTION_STATUS.PARTIALLY_REFUNDED;

      await Promise.all([
        this.repo.update_refund(refund_id, {
          status: REFUND_STATUS.COMPLETED,
          provider_refund_id: result.provider_refund_id,
          provider_response: result.provider_response,
          fee_refunded: result.fee_refunded ? String(result.fee_refunded) : refund.fee_refunded,
          processed_at: new Date().toISOString(),
        }),
        this.repo.update_transaction(transaction.id, {
          refunded_amount: new_refunded_amount,
          status: new_status,
        }),
      ]);

      await payment_audit_service.log({
        refund_id,
        transaction_id: transaction.id,
        order_id: transaction.order_id,
        actor_user_id,
        action: AUDIT_ACTION.REFUND_PROCESSED,
        resource_type: "payment_refund",
        resource_id: refund_id,
        from_status: REFUND_STATUS.PROCESSING,
        to_status: REFUND_STATUS.COMPLETED,
        metadata: {
          amount: refund.amount,
          provider_refund_id: result.provider_refund_id,
          new_transaction_status: new_status,
        },
      });
    } catch (e) {
      await this.repo.update_refund(refund_id, {
        status: REFUND_STATUS.FAILED,
        failure_reason: (e as Error).message,
      });

      await payment_audit_service.log({
        refund_id,
        transaction_id: transaction.id,
        order_id: transaction.order_id,
        actor_user_id,
        action: AUDIT_ACTION.REFUND_FAILED,
        resource_type: "payment_refund",
        resource_id: refund_id,
        from_status: REFUND_STATUS.PROCESSING,
        to_status: REFUND_STATUS.FAILED,
        metadata: { error: (e as Error).message },
      });

      throw_error(PAYMENT_ERROR.PAYMENT_PROVIDER_ERROR, {
        provider: transaction.provider,
        message: (e as Error).message,
      });
    }
  }

  async list_refunds(
    page: number,
    limit: number,
    filters?: {
      status?: string;
      type?: string;
      transaction_id?: string;
      order_id?: string;
    },
  ) {
    return this.repo.list_refunds(page, limit, filters);
  }

  async get_refund_stats() {
    return this.repo.get_refund_stats();
  }

  async get_refunds_for_transaction(transaction_id: string) {
    return this.repo.find_refunds_for_transaction(transaction_id);
  }

  async get_refund(refund_id: string) {
    const refund = await this.repo.find_refund(refund_id);
    if (!refund) {
      throw_error(PAYMENT_ERROR.REFUND_NOT_FOUND, { refund_id });
    }
    return refund;
  }
}

export const payment_refund_service = new PaymentRefundService();
