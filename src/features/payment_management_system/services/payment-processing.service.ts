import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { payment_repository } from "../repositories/payment.repository";
import { payment_audit_service } from "./payment-audit.service";
import { get_payment_provider } from "../providers/provider-registry";
import {
  PAYMENT_TRANSACTION_STATUS,
  PAYMENT_TRANSACTION_TYPE,
  PAYMENT_ALLOWED_TRANSITIONS,
  AUDIT_ACTION,
} from "../constants/payment-status";
import type { PaymentProviderName } from "../providers/contracts";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { orders } from "@/features/order_management_system/orders/schema";

export class PaymentProcessingService {
  constructor(private readonly repo = payment_repository) {}

  async process(input: {
    order_id: string;
    provider: PaymentProviderName;
    amount: number;
    currency: string;
    description?: string;
    idempotency_key?: string;
    metadata?: Record<string, unknown>;
    return_url?: string;
    cancel_url?: string;
    actor_user_id?: string;
    type?: string;
  }) {
    if (input.idempotency_key) {
      const existing = await this.repo.find_transaction_by_idempotency(input.idempotency_key);
      if (existing) {
        return existing;
      }
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, input.order_id))
      .limit(1);

    if (!order) {
      throw_error(PAYMENT_ERROR.ORDER_NOT_ELIGIBLE, { order_id: input.order_id });
    }

    if (
      order.payment_status === "paid" ||
      order.payment_status === "partially_paid"
    ) {
      throw_error(PAYMENT_ERROR.ORDER_NOT_ELIGIBLE, {
        order_id: input.order_id,
        payment_status: order.payment_status,
      });
    }

    const transaction = await this.repo.create_transaction({
      order_id: input.order_id,
      user_id: input.actor_user_id ?? order.user_id,
      provider: input.provider,
      type: input.type ?? PAYMENT_TRANSACTION_TYPE.FULL,
      status: PAYMENT_TRANSACTION_STATUS.PENDING,
      currency: input.currency,
      amount: String(input.amount),
      fee: "0.00",
      net_amount: String(input.amount),
      refunded_amount: "0.00",
      idempotency_key: input.idempotency_key ?? null,
      description: input.description ?? null,
      metadata: input.metadata ?? {},
      max_retries: 3,
      retry_count: 0,
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: input.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYMENT_CREATED,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      to_status: PAYMENT_TRANSACTION_STATUS.PENDING,
      metadata: { provider: input.provider, amount: input.amount },
    });

    return transaction;
  }

  async capture(input: {
    transaction_id: string;
    amount?: number;
    actor_user_id?: string;
  }) {
    const transaction = await this.repo.find_transaction(input.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: input.transaction_id,
      });
    }

    if (transaction.status === PAYMENT_TRANSACTION_STATUS.CAPTURED) {
      throw_error(PAYMENT_ERROR.ALREADY_CAPTURED, {
        transaction_id: input.transaction_id,
      });
    }

    if (!PAYMENT_ALLOWED_TRANSITIONS[transaction.status]?.includes("captured")) {
      throw_error(PAYMENT_ERROR.INVALID_STATUS_TRANSITION, {
        from: transaction.status,
        to: "captured",
      });
    }

    const provider = get_payment_provider(transaction.provider as PaymentProviderName);
    const capture_amount = input.amount ?? Number(transaction.amount);

    const result = await provider.capture_payment({
      amount: capture_amount,
      currency: transaction.currency,
      provider_transaction_id: transaction.provider_transaction_id ?? transaction.id,
    });

    const updated = await this.repo.update_transaction(transaction.id, {
      status: PAYMENT_TRANSACTION_STATUS.CAPTURED,
      provider_transaction_id: result.provider_transaction_id,
      provider_response: result.provider_response,
      fee: result.fee ? String(result.fee) : transaction.fee,
      net_amount: result.net_amount ? String(result.net_amount) : transaction.net_amount,
      captured_at: new Date().toISOString(),
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: transaction.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYMENT_CAPTURED,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      from_status: transaction.status,
      to_status: PAYMENT_TRANSACTION_STATUS.CAPTURED,
      changes: { amount: capture_amount, provider_response: result.provider_response },
    });

    return updated;
  }

  async cancel(input: {
    transaction_id: string;
    reason?: string;
    actor_user_id?: string;
  }) {
    const transaction = await this.repo.find_transaction(input.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: input.transaction_id,
      });
    }

    if (!PAYMENT_ALLOWED_TRANSITIONS[transaction.status]?.includes("cancelled")) {
      throw_error(PAYMENT_ERROR.INVALID_STATUS_TRANSITION, {
        from: transaction.status,
        to: "cancelled",
      });
    }

    const updated = await this.repo.update_transaction(transaction.id, {
      status: PAYMENT_TRANSACTION_STATUS.CANCELLED,
      failure_reason: input.reason ?? null,
      metadata: { ...transaction.metadata, cancelled_by: input.actor_user_id, cancel_reason: input.reason },
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: transaction.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYMENT_CANCELLED,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      from_status: transaction.status,
      to_status: PAYMENT_TRANSACTION_STATUS.CANCELLED,
      metadata: { reason: input.reason },
    });

    return updated;
  }

  async fail(input: {
    transaction_id: string;
    reason: string;
    failure_code?: string;
    actor_user_id?: string;
  }) {
    const transaction = await this.repo.find_transaction(input.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: input.transaction_id,
      });
    }

    const updated = await this.repo.update_transaction(transaction.id, {
      status: PAYMENT_TRANSACTION_STATUS.FAILED,
      failure_reason: input.reason,
      failure_code: input.failure_code ?? null,
      failed_at: new Date().toISOString(),
      retry_count: transaction.retry_count + 1,
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: transaction.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYMENT_FAILED,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      from_status: transaction.status,
      to_status: PAYMENT_TRANSACTION_STATUS.FAILED,
      metadata: { reason: input.reason, failure_code: input.failure_code },
    });

    return updated;
  }

  async mark_completed(input: {
    transaction_id: string;
    provider_transaction_id?: string;
    provider_response?: Record<string, unknown>;
    fee?: number;
    net_amount?: number;
    actor_user_id?: string;
  }) {
    const transaction = await this.repo.find_transaction(input.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: input.transaction_id,
      });
    }

    const patch: Record<string, unknown> = {
      status: PAYMENT_TRANSACTION_STATUS.COMPLETED,
      captured_at: new Date().toISOString(),
    };

    if (input.provider_transaction_id) {
      patch.provider_transaction_id = input.provider_transaction_id;
    }
    if (input.provider_response) {
      patch.provider_response = input.provider_response;
    }
    if (input.fee !== undefined) {
      patch.fee = String(input.fee);
    }
    if (input.net_amount !== undefined) {
      patch.net_amount = String(input.net_amount);
    }

    const updated = await this.repo.update_transaction(
      transaction.id,
      patch as Partial<typeof transaction>,
    );

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: transaction.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYMENT_CAPTURED,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      from_status: transaction.status,
      to_status: PAYMENT_TRANSACTION_STATUS.COMPLETED,
    });

    return updated;
  }

  async retry(input: {
    transaction_id: string;
    actor_user_id?: string;
  }) {
    const transaction = await this.repo.find_transaction(input.transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, {
        transaction_id: input.transaction_id,
      });
    }

    if (transaction.retry_count >= transaction.max_retries) {
      throw_error(PAYMENT_ERROR.MAX_RETRIES_EXCEEDED, {
        transaction_id: input.transaction_id,
        retry_count: transaction.retry_count,
        max_retries: transaction.max_retries,
      });
    }

    if (transaction.status !== PAYMENT_TRANSACTION_STATUS.FAILED) {
      throw_error(PAYMENT_ERROR.INVALID_STATUS_TRANSITION, {
        from: transaction.status,
        to: "pending",
      });
    }

    const updated = await this.repo.update_transaction(transaction.id, {
      status: PAYMENT_TRANSACTION_STATUS.PENDING,
      failure_reason: null,
      failure_code: null,
      failed_at: null,
      retry_count: transaction.retry_count + 1,
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: transaction.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYMENT_RETRIED,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      from_status: PAYMENT_TRANSACTION_STATUS.FAILED,
      to_status: PAYMENT_TRANSACTION_STATUS.PENDING,
      metadata: { retry_count: transaction.retry_count + 1 },
    });

    return updated;
  }

  async sync_provider_status(transaction_id: string) {
    const transaction = await this.repo.find_transaction(transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, { transaction_id });
    }

    if (!transaction.provider_transaction_id) {
      return transaction;
    }

    const provider = get_payment_provider(transaction.provider as PaymentProviderName);
    const result = await provider.get_transaction_status(
      transaction.provider_transaction_id,
    );

    const updated = await this.repo.update_transaction(transaction.id, {
      provider_response: result.provider_response,
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: transaction.order_id,
      action: AUDIT_ACTION.PROVIDER_SYNC,
      resource_type: "payment_transaction",
      resource_id: transaction.id,
      from_status: transaction.status,
      to_status: result.status,
      metadata: { provider_status: result.status },
    });

    return updated;
  }

  async list(
    page: number,
    limit: number,
    filters?: {
      status?: string;
      type?: string;
      provider?: string;
      order_id?: string;
      user_id?: string;
      date_from?: string;
      date_to?: string;
      search?: string;
    },
  ) {
    return this.repo.list_transactions(page, limit, filters);
  }

  async get_stats() {
    return this.repo.get_transactions_stats();
  }

  async get_charts(days = 30) {
    return this.repo.get_chart_data(days);
  }

  async get_for_order(order_id: string) {
    return this.repo.list_transactions_for_order(order_id);
  }

  async get_for_customer(user_id: string, page: number, limit: number) {
    return this.repo.list_transactions_for_customer(user_id, page, limit);
  }

  async get_by_id(transaction_id: string) {
    const transaction = await this.repo.find_transaction(transaction_id);
    if (!transaction) {
      throw_error(PAYMENT_ERROR.TRANSACTION_NOT_FOUND, { transaction_id });
    }
    return transaction;
  }
}

export const payment_processing_service = new PaymentProcessingService();
