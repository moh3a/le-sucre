import "server-only";
import { payment_repository } from "../repositories/payment.repository";
import { payment_audit_service } from "./payment-audit.service";
import { PAYOUT_STATUS, AUDIT_ACTION } from "../constants/payment-status";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";

export class SplitPaymentService {
  constructor(private readonly repo = payment_repository) {}

  async create_vendor_payout(input: {
    vendor_id: string;
    transaction_id?: string;
    order_id?: string;
    gross_amount: number;
    commission_rate: number;
    currency: string;
    description?: string;
    payout_method?: string;
    items?: Array<{
      order_item_id: string;
      sku_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      net_amount: number;
    }>;
    metadata?: Record<string, unknown>;
    actor_user_id?: string;
  }) {
    const commission_amount = (input.gross_amount * input.commission_rate) / 100;
    const net_amount = input.gross_amount - commission_amount;

    const payout = await this.repo.create_payout({
      vendor_id: input.vendor_id,
      transaction_id: input.transaction_id ?? null,
      order_id: input.order_id ?? null,
      type: "vendor_payout",
      status: PAYOUT_STATUS.PENDING,
      currency: input.currency,
      gross_amount: String(input.gross_amount),
      commission_amount: String(commission_amount),
      commission_rate: String(input.commission_rate),
      net_amount: String(net_amount),
      fee: "0.00",
      payout_method: input.payout_method ?? null,
      description: input.description ?? null,
      metadata: input.metadata ?? {},
    });

    if (input.items && input.items.length > 0) {
      for (const item of input.items) {
        const item_commission = (item.net_amount * input.commission_rate) / 100;
        const item_net = item.net_amount - item_commission;

        await this.repo.create_payout_item({
          payout_id: payout.id,
          order_item_id: item.order_item_id,
          sku_id: item.sku_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: String(item.unit_price),
          commission_amount: String(item_commission),
          net_amount: String(item_net),
        });
      }
    }

    await payment_audit_service.log({
      payout_id: payout.id,
      order_id: input.order_id,
      actor_user_id: input.actor_user_id,
      action: AUDIT_ACTION.PAYOUT_CREATED,
      resource_type: "payment_payout",
      resource_id: payout.id,
      metadata: {
        vendor_id: input.vendor_id,
        gross_amount: input.gross_amount,
        commission_amount,
        net_amount,
        item_count: input.items?.length ?? 0,
      },
    });

    return payout;
  }

  async process_payout(
    payout_id: string,
    provider_response?: Record<string, unknown>,
    actor_user_id?: string,
  ) {
    const payout = await this.repo.find_payout(payout_id);
    if (!payout) {
      throw_error(PAYMENT_ERROR.PAYOUT_NOT_FOUND, { payout_id });
    }

    if (payout.status !== PAYOUT_STATUS.PENDING) {
      throw_error(PAYMENT_ERROR.PAYOUT_ALREADY_PROCESSED, {
        payout_id,
        status: payout.status,
      });
    }

    const updated = await this.repo.update_payout(payout_id, {
      status: PAYOUT_STATUS.PROCESSING,
      provider_response: provider_response ?? {},
    });

    await payment_audit_service.log({
      payout_id,
      order_id: payout.order_id,
      actor_user_id,
      action: AUDIT_ACTION.PAYOUT_PROCESSED,
      resource_type: "payment_payout",
      resource_id: payout_id,
      from_status: PAYOUT_STATUS.PENDING,
      to_status: PAYOUT_STATUS.PROCESSING,
    });

    return updated;
  }

  async complete_payout(
    payout_id: string,
    payout_reference?: string,
    provider_response?: Record<string, unknown>,
    actor_user_id?: string,
  ) {
    const payout = await this.repo.find_payout(payout_id);
    if (!payout) {
      throw_error(PAYMENT_ERROR.PAYOUT_NOT_FOUND, { payout_id });
    }

    const updated = await this.repo.update_payout(payout_id, {
      status: PAYOUT_STATUS.COMPLETED,
      payout_reference: payout_reference ?? null,
      provider_response: provider_response ?? payout.provider_response,
      paid_at: new Date().toISOString(),
    });

    await payment_audit_service.log({
      payout_id,
      order_id: payout.order_id,
      actor_user_id,
      action: AUDIT_ACTION.PAYOUT_PROCESSED,
      resource_type: "payment_payout",
      resource_id: payout_id,
      from_status: payout.status,
      to_status: PAYOUT_STATUS.COMPLETED,
    });

    return updated;
  }

  async fail_payout(
    payout_id: string,
    failure_reason: string,
    actor_user_id?: string,
  ) {
    const payout = await this.repo.find_payout(payout_id);
    if (!payout) {
      throw_error(PAYMENT_ERROR.PAYOUT_NOT_FOUND, { payout_id });
    }

    const updated = await this.repo.update_payout(payout_id, {
      status: PAYOUT_STATUS.FAILED,
      failure_reason,
    });

    await payment_audit_service.log({
      payout_id,
      order_id: payout.order_id,
      actor_user_id,
      action: AUDIT_ACTION.PAYOUT_FAILED,
      resource_type: "payment_payout",
      resource_id: payout_id,
      from_status: payout.status,
      to_status: PAYOUT_STATUS.FAILED,
      metadata: { failure_reason },
    });

    return updated;
  }

  async list_payouts(page: number, limit: number, filters?: { status?: string; vendor_id?: string }) {
    return this.repo.list_payouts(page, limit, filters);
  }

  async get_payout_stats() {
    return this.repo.get_payout_stats();
  }

  async get_payout(id: string) {
    const payout = await this.repo.find_payout_with_items(id);
    if (!payout) {
      throw_error(PAYMENT_ERROR.PAYOUT_NOT_FOUND, { payout_id: id });
    }
    return payout;
  }

  async get_vendor_balance(vendor_id: string) {
    const payouts = await this.repo.list_payouts(1, 1000, { vendor_id });
    let paid_amount = 0;
    let pending_amount = 0;

    for (const payout of payouts.items) {
      const net = Number(payout.net_amount);
      if (payout.status === "completed") {
        paid_amount += net;
      } else if (payout.status === "pending" || payout.status === "processing") {
        pending_amount += net;
      }
    }

    return {
      vendor_id,
      paid_amount,
      pending_amount,
      total_earned: paid_amount + pending_amount,
    };
  }
}

export const split_payment_service = new SplitPaymentService();
