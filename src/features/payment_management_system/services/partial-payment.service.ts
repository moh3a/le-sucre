import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payment_repository } from "../repositories/payment.repository";
import { payment_audit_service } from "./payment-audit.service";
import { payment_processing_service } from "./payment-processing.service";
import {
  PARTIAL_PAYMENT_TYPE,
  PARTIAL_PAYMENT_STATUS,
  PAYMENT_TRANSACTION_STATUS,
  PAYMENT_TRANSACTION_TYPE,
  AUDIT_ACTION,
} from "../constants/payment-status";
import type { PaymentProviderName } from "../providers/contracts";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { orders } from "@/features/order_management_system/orders/schema";

export class PartialPaymentService {
  constructor(private readonly repo = payment_repository) {}

  async create_deposit(input: {
    order_id: string;
    provider: PaymentProviderName;
    deposit_percentage: number;
    currency: string;
    actor_user_id?: string;
  }) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, input.order_id))
      .limit(1);

    if (!order) {
      throw_error(PAYMENT_ERROR.PARTIAL_PAYMENT_NOT_ELIGIBLE, { order_id: input.order_id });
    }

    if (input.deposit_percentage > 100 || input.deposit_percentage < 1) {
      throw_error(PAYMENT_ERROR.INVALID_AMOUNT, { deposit_percentage: input.deposit_percentage });
    }

    const grand_total = Number(order.grand_total);
    const deposit_amount = (grand_total * input.deposit_percentage) / 100;
    const remaining_amount = grand_total - deposit_amount;

    const transaction = await payment_processing_service.process({
      order_id: input.order_id,
      provider: input.provider,
      amount: deposit_amount,
      currency: input.currency,
      type: PAYMENT_TRANSACTION_TYPE.DEPOSIT,
      description: `Dépôt de ${input.deposit_percentage}% pour la commande ${order.order_number}`,
      actor_user_id: input.actor_user_id,
    });

    const partial = await this.repo.create_partial({
      transaction_id: transaction.id,
      order_id: input.order_id,
      type: PARTIAL_PAYMENT_TYPE.DEPOSIT,
      status: PARTIAL_PAYMENT_STATUS.PENDING,
      percentage: String(input.deposit_percentage),
      amount: String(deposit_amount),
      paid_amount: "0.00",
      remaining_amount: String(remaining_amount),
      due_at: new Date().toISOString(),
    });

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: input.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PARTIAL_PAYMENT_CREATED,
      resource_type: "payment_partial",
      resource_id: partial.id,
      metadata: {
        type: "deposit",
        percentage: input.deposit_percentage,
        deposit_amount,
        remaining_amount,
      },
    });

    return { transaction, partial };
  }

  async create_installment_plan(input: {
    order_id: string;
    provider: PaymentProviderName;
    total_installments: number;
    currency: string;
    actor_user_id?: string;
  }) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, input.order_id))
      .limit(1);

    if (!order) {
      throw_error(PAYMENT_ERROR.PARTIAL_PAYMENT_NOT_ELIGIBLE, { order_id: input.order_id });
    }

    if (input.total_installments < 2 || input.total_installments > 36) {
      throw_error(PAYMENT_ERROR.INVALID_AMOUNT, {
        total_installments: input.total_installments,
      });
    }

    const grand_total = Number(order.grand_total);
    const installment_amount = grand_total / input.total_installments;
    const first_installment_amount = grand_total - installment_amount * (input.total_installments - 1);

    const transaction = await payment_processing_service.process({
      order_id: input.order_id,
      provider: input.provider,
      amount: first_installment_amount,
      currency: input.currency,
      type: PAYMENT_TRANSACTION_TYPE.INSTALLMENT,
      description: `Paiement en ${input.total_installments} fois pour la commande ${order.order_number}`,
      actor_user_id: input.actor_user_id,
    });

    const partials = [];
    const now = new Date();

    for (let i = 0; i < input.total_installments; i++) {
      const amount = i === 0 ? first_installment_amount : installment_amount;
      const due_at = new Date(now);
      due_at.setMonth(due_at.getMonth() + i);

      const partial = await this.repo.create_partial({
        transaction_id: transaction.id,
        order_id: input.order_id,
        type: PARTIAL_PAYMENT_TYPE.INSTALLMENT,
        status: i === 0 ? PARTIAL_PAYMENT_STATUS.PENDING : PARTIAL_PAYMENT_STATUS.PENDING,
        installment_number: i + 1,
        total_installments: input.total_installments,
        percentage: String((amount / grand_total) * 100),
        amount: String(amount),
        paid_amount: "0.00",
        remaining_amount: String(amount),
        due_at: due_at.toISOString(),
      });

      partials.push(partial);
    }

    await payment_audit_service.log({
      transaction_id: transaction.id,
      order_id: input.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PARTIAL_PAYMENT_CREATED,
      resource_type: "payment_partial",
      resource_id: partials[0].id,
      metadata: {
        type: "installment_plan",
        total_installments: input.total_installments,
        installment_amount,
        first_installment: first_installment_amount,
      },
    });

    return { transaction, partials };
  }

  async mark_installment_paid(
    installment_id: string,
    provider?: PaymentProviderName,
  ) {
    const partial = await this.repo.find_partial(installment_id);
    if (!partial) {
      throw_error(PAYMENT_ERROR.INSTALLMENT_NOT_FOUND, { installment_id });
    }

    if (partial.status === PARTIAL_PAYMENT_STATUS.PAID) {
      throw_error(PAYMENT_ERROR.INSTALLMENT_ALREADY_PAID, { installment_id });
    }

    const updated = await this.repo.update_partial(installment_id, {
      status: PARTIAL_PAYMENT_STATUS.PAID,
      paid_amount: partial.amount,
      remaining_amount: "0.00",
      paid_at: new Date().toISOString(),
    });

    await payment_audit_service.log({
      transaction_id: partial.transaction_id,
      order_id: partial.order_id,
      action: AUDIT_ACTION.INSTALLMENT_PAID,
      resource_type: "payment_partial",
      resource_id: installment_id,
      from_status: partial.status,
      to_status: PARTIAL_PAYMENT_STATUS.PAID,
      metadata: {
        installment_number: partial.installment_number,
        amount: partial.amount,
      },
    });

    return updated;
  }

  async get_installment_plan(order_id: string) {
    return this.repo.find_partials_for_order(order_id);
  }

  async get_overdue_installments() {
    const overdue = await this.repo.find_overdue_installments();
    return overdue.map((i) => ({
      ...i,
      days_overdue: Math.floor(
        (Date.now() - new Date(i.due_at).getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }
}

export const partial_payment_service = new PartialPaymentService();
