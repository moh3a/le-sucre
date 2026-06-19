import "server-only";
import { payment_repository } from "../repositories/payment.repository";
import type { AuditAction } from "../constants/payment-status";

export class PaymentAuditService {
  constructor(private readonly repo = payment_repository) {}

  async log(input: {
    transaction_id?: string | null;
    refund_id?: string | null;
    payout_id?: string | null;
    order_id?: string | null;
    actor_user_id?: string | null;
    action: AuditAction;
    resource_type: string;
    resource_id: string;
    from_status?: string | null;
    to_status?: string | null;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ip_address?: string | null;
    user_agent?: string | null;
  }) {
    return this.repo.create_audit_log({
      transaction_id: input.transaction_id ?? null,
      refund_id: input.refund_id ?? null,
      payout_id: input.payout_id ?? null,
      order_id: input.order_id ?? null,
      actor_user_id: input.actor_user_id ?? null,
      action: input.action,
      resource_type: input.resource_type,
      resource_id: input.resource_id,
      from_status: input.from_status ?? null,
      to_status: input.to_status ?? null,
      changes: input.changes ?? {},
      metadata: input.metadata ?? {},
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
    });
  }

  async list(
    page: number,
    limit: number,
    filters?: {
      transaction_id?: string;
      refund_id?: string;
      action?: string;
      resource_type?: string;
      date_from?: string;
      date_to?: string;
    },
  ) {
    return this.repo.list_audit_logs(page, limit, filters);
  }
}

export const payment_audit_service = new PaymentAuditService();
