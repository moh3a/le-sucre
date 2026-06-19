import "server-only";
import { and, count, desc, eq, gte, inArray, lt, lte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import {
  payment_transactions,
  payment_partials,
  payment_refunds,
  payment_payouts,
  payment_payout_items,
  payment_audit_logs,
} from "../db/schema";
import { PAYMENT_TRANSACTION_STATUS } from "../constants/payment-status";
import type { PaymentTransactionStatus } from "../constants/payment-status";
import type { PaymentTransaction } from "../types";
import { orders } from "@/features/order_management_system/orders/schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

const TRANSACTION_WITH_RELATIONS = {
  id: payment_transactions.id,
  order_id: payment_transactions.order_id,
  user_id: payment_transactions.user_id,
  invoice_id: payment_transactions.invoice_id,
  provider: payment_transactions.provider,
  provider_transaction_id: payment_transactions.provider_transaction_id,
  provider_payment_method: payment_transactions.provider_payment_method,
  provider_response: payment_transactions.provider_response,
  type: payment_transactions.type,
  status: payment_transactions.status,
  currency: payment_transactions.currency,
  amount: payment_transactions.amount,
  fee: payment_transactions.fee,
  net_amount: payment_transactions.net_amount,
  refunded_amount: payment_transactions.refunded_amount,
  failure_reason: payment_transactions.failure_reason,
  failure_code: payment_transactions.failure_code,
  retry_count: payment_transactions.retry_count,
  max_retries: payment_transactions.max_retries,
  idempotency_key: payment_transactions.idempotency_key,
  description: payment_transactions.description,
  metadata: payment_transactions.metadata,
  captured_at: payment_transactions.captured_at,
  failed_at: payment_transactions.failed_at,
  created_at: payment_transactions.created_at,
  updated_at: payment_transactions.updated_at,
};

export class PaymentRepository {
  // ─── Transactions ──────────────────────────────────────

  async find_transaction(id: string) {
    return await db
      .select()
      .from(payment_transactions)
      .where(eq(payment_transactions.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_transaction_by_provider_ref(
    provider: string,
    provider_transaction_id: string,
  ) {
    return await db
      .select()
      .from(payment_transactions)
      .where(
        and(
          eq(payment_transactions.provider, provider),
          eq(payment_transactions.provider_transaction_id, provider_transaction_id),
        ),
      )
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_transaction_by_idempotency(idempotency_key: string) {
    return await db
      .select()
      .from(payment_transactions)
      .where(eq(payment_transactions.idempotency_key, idempotency_key))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_transaction_with_order(id: string) {
    return await db
      .select({ ...TRANSACTION_WITH_RELATIONS })
      .from(payment_transactions)
      .where(eq(payment_transactions.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async create_transaction(
    input: typeof payment_transactions.$inferInsert,
  ) {
    const [created] = await db.insert(payment_transactions).values(input).$returningId();
    return this.find_transaction(created.id);
  }

  async update_transaction(
    id: string,
    patch: Partial<typeof payment_transactions.$inferInsert>,
  ) {
    await db.update(payment_transactions).set(patch).where(eq(payment_transactions.id, id));
    return this.find_transaction(id);
  }

  async list_transactions(
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
    const offset = (Math.max(page, 1) - 1) * limit;
    const conditions = [];

    if (filters?.status) conditions.push(eq(payment_transactions.status, filters.status));
    if (filters?.type) conditions.push(eq(payment_transactions.type, filters.type));
    if (filters?.provider) conditions.push(eq(payment_transactions.provider, filters.provider));
    if (filters?.order_id) conditions.push(eq(payment_transactions.order_id, filters.order_id));
    if (filters?.user_id) conditions.push(eq(payment_transactions.user_id, filters.user_id));
    if (filters?.date_from) conditions.push(gte(payment_transactions.created_at, filters.date_from));
    if (filters?.date_to) conditions.push(lte(payment_transactions.created_at, filters.date_to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, total_row] = await Promise.all([
      db
        .select({
          ...TRANSACTION_WITH_RELATIONS,
          order_number: orders.order_number,
          user_name: users.name,
          user_email: users.email,
        })
        .from(payment_transactions)
        .leftJoin(orders, eq(payment_transactions.order_id, orders.id))
        .leftJoin(users, eq(payment_transactions.user_id, users.id))
        .where(where)
        .orderBy(desc(payment_transactions.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(payment_transactions)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
    ]);

    const total_records = Number(total_row);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.ceil(total_records / limit),
        has_more: offset + limit < total_records,
      },
    };
  }

  async list_transactions_for_order(order_id: string) {
    return await db
      .select()
      .from(payment_transactions)
      .where(eq(payment_transactions.order_id, order_id))
      .orderBy(desc(payment_transactions.created_at));
  }

  async list_transactions_for_customer(
    user_id: string,
    page: number,
    limit: number,
  ) {
    const offset = (Math.max(page, 1) - 1) * limit;
    const conditions = [eq(payment_transactions.user_id, user_id)];

    const [items, total_row] = await Promise.all([
      db
        .select({
          ...TRANSACTION_WITH_RELATIONS,
          order_number: orders.order_number,
        })
        .from(payment_transactions)
        .leftJoin(orders, eq(payment_transactions.order_id, orders.id))
        .where(and(...conditions))
        .orderBy(desc(payment_transactions.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(payment_transactions)
        .where(and(...conditions))
        .then((r) => r[0]?.total ?? 0),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total_records: Number(total_row),
        total_pages: Math.ceil(Number(total_row) / limit),
        has_more: offset + limit < Number(total_row),
      },
    };
  }

  async get_transactions_stats() {
    const [revenue_row, counts_row, period_row, prev_row] = await Promise.all([
      db
        .select({
          total_revenue: sum(payment_transactions.amount).as("total_revenue"),
          total_fees: sum(payment_transactions.fee).as("total_fees"),
          total_refunded: sum(payment_transactions.refunded_amount).as("total_refunded"),
        })
        .from(payment_transactions)
        .where(
          inArray(payment_transactions.status, [
            PAYMENT_TRANSACTION_STATUS.CAPTURED,
            PAYMENT_TRANSACTION_STATUS.COMPLETED,
            PAYMENT_TRANSACTION_STATUS.PARTIALLY_REFUNDED,
          ]),
        )
        .then((r) => r[0] ?? null),
      db
        .select({
          total: count(),
          successful: sql<number>`SUM(CASE WHEN status IN ('captured','completed') THEN 1 ELSE 0 END)`,
          failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
          pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
          processing: sql<number>`SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END)`,
          refunded_amount: sql<string>`COALESCE(SUM(refunded_amount), 0)`,
        })
        .from(payment_transactions)
        .then((r) => r[0] ?? null),
      db
        .select({
          revenue: sum(payment_transactions.amount),
          count: count(),
        })
        .from(payment_transactions)
        .where(
          and(
            gte(
              payment_transactions.created_at,
              sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            ),
            inArray(payment_transactions.status, [
              PAYMENT_TRANSACTION_STATUS.CAPTURED,
              PAYMENT_TRANSACTION_STATUS.COMPLETED,
            ]),
          ),
        )
        .then((r) => r[0] ?? null),
      db
        .select({
          revenue: sum(payment_transactions.amount),
          count: count(),
        })
        .from(payment_transactions)
        .where(
          and(
            gte(
              payment_transactions.created_at,
              sql`DATE_SUB(NOW(), INTERVAL 60 DAY)`,
            ),
            lt(
              payment_transactions.created_at,
              sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            ),
            inArray(payment_transactions.status, [
              PAYMENT_TRANSACTION_STATUS.CAPTURED,
              PAYMENT_TRANSACTION_STATUS.COMPLETED,
            ]),
          ),
        )
        .then((r) => r[0] ?? null),
    ]);

    const total_revenue = Number(revenue_row?.total_revenue ?? 0);
    const total_fees = Number(revenue_row?.total_fees ?? 0);
    const total_refunded_amount = Number(revenue_row?.total_refunded ?? 0);
    const total_transactions = Number(counts_row?.total ?? 0);
    const successful = Number(counts_row?.successful ?? 0);
    const failed = Number(counts_row?.failed ?? 0);
    const pending = Number(counts_row?.pending ?? 0);
    const processing = Number(counts_row?.processing ?? 0);
    const period_revenue = Number(period_row?.revenue ?? 0);
    const period_transactions = Number(period_row?.count ?? 0);
    const prev_revenue = Number(prev_row?.revenue ?? 0);
    const prev_count = Number(prev_row?.count ?? 0);

    return {
      total_revenue,
      total_transactions,
      successful_transactions: successful,
      failed_transactions: failed,
      total_refunds: 0,
      refund_amount: total_refunded_amount,
      total_fees,
      net_revenue: total_revenue - total_fees - total_refunded_amount,
      pending_transactions: pending,
      processing_transactions: processing,
      average_transaction_value: successful > 0 ? total_revenue / successful : 0,
      period_revenue,
      period_transactions,
      period_refunds: total_refunded_amount,
      previous_period_revenue: prev_revenue,
      previous_period_transactions: prev_count,
      revenue_growth: prev_revenue > 0 ? ((period_revenue - prev_revenue) / prev_revenue) * 100 : 0,
      transaction_growth: prev_count > 0 ? ((period_transactions - prev_count) / prev_count) * 100 : 0,
    };
  }

  async get_chart_data(days = 30) {
    const [daily, payment_methods, status_distribution] = await Promise.all([
      db
        .select({
          date: sql<string>`DATE(created_at)`,
          revenue: sum(payment_transactions.amount).as("revenue"),
          fees: sum(payment_transactions.fee).as("fees"),
          refunds: sum(payment_transactions.refunded_amount).as("refunds"),
        })
        .from(payment_transactions)
        .where(
          gte(payment_transactions.created_at, sql`DATE_SUB(NOW(), INTERVAL ${days} DAY)`),
        )
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`),
      db
        .select({
          provider: payment_transactions.provider,
          count: count(),
          total: sum(payment_transactions.amount).as("total"),
        })
        .from(payment_transactions)
        .where(
          inArray(payment_transactions.status, [
            PAYMENT_TRANSACTION_STATUS.CAPTURED,
            PAYMENT_TRANSACTION_STATUS.COMPLETED,
          ]),
        )
        .groupBy(payment_transactions.provider),
      db
        .select({
          status: payment_transactions.status,
          count: count(),
        })
        .from(payment_transactions)
        .groupBy(payment_transactions.status),
    ]);

    return {
      daily_revenue: daily.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue ?? 0),
        fees: Number(d.fees ?? 0),
        refunds: Number(d.refunds ?? 0),
      })),
      payment_methods: payment_methods.map((p) => ({
        provider: p.provider,
        count: Number(p.count),
        total: Number(p.total ?? 0),
      })),
      status_distribution: status_distribution.map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
    };
  }

  // ─── Partial Payments / Installments ────────────────────

  async find_partial(id: string) {
    return await db
      .select()
      .from(payment_partials)
      .where(eq(payment_partials.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_partials_for_order(order_id: string) {
    return await db
      .select()
      .from(payment_partials)
      .where(eq(payment_partials.order_id, order_id))
      .orderBy(payment_partials.installment_number);
  }

  async find_partials_for_transaction(transaction_id: string) {
    return await db
      .select()
      .from(payment_partials)
      .where(eq(payment_partials.transaction_id, transaction_id))
      .orderBy(payment_partials.installment_number);
  }

  async create_partial(input: typeof payment_partials.$inferInsert) {
    const [created] = await db.insert(payment_partials).values(input).$returningId();
    return this.find_partial(created.id);
  }

  async update_partial(id: string, patch: Partial<typeof payment_partials.$inferInsert>) {
    await db.update(payment_partials).set(patch).where(eq(payment_partials.id, id));
    return this.find_partial(id);
  }

  async find_overdue_installments() {
    return await db
      .select()
      .from(payment_partials)
      .where(
        and(
          eq(payment_partials.status, "pending"),
          lte(payment_partials.due_at, sql`NOW()`),
        ),
      );
  }

  async find_partials_due_for_reminder() {
    return await db
      .select()
      .from(payment_partials)
      .where(
        and(
          eq(payment_partials.status, "pending"),
          gte(payment_partials.due_at, sql`NOW()`),
          lte(payment_partials.due_at, sql`DATE_ADD(NOW(), INTERVAL 3 DAY)`),
        ),
      );
  }

  // ─── Refunds ──────────────────────────────────────────

  async find_refund(id: string) {
    return await db
      .select()
      .from(payment_refunds)
      .where(eq(payment_refunds.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_refunds_for_transaction(transaction_id: string) {
    return await db
      .select()
      .from(payment_refunds)
      .where(eq(payment_refunds.transaction_id, transaction_id))
      .orderBy(desc(payment_refunds.created_at));
  }

  async create_refund(input: typeof payment_refunds.$inferInsert) {
    const [created] = await db.insert(payment_refunds).values(input).$returningId();
    return this.find_refund(created.id);
  }

  async update_refund(id: string, patch: Partial<typeof payment_refunds.$inferInsert>) {
    await db.update(payment_refunds).set(patch).where(eq(payment_refunds.id, id));
    return this.find_refund(id);
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
    const offset = (Math.max(page, 1) - 1) * limit;
    const conditions = [];

    if (filters?.status) conditions.push(eq(payment_refunds.status, filters.status));
    if (filters?.type) conditions.push(eq(payment_refunds.type, filters.type));
    if (filters?.transaction_id)
      conditions.push(eq(payment_refunds.transaction_id, filters.transaction_id));
    if (filters?.order_id) conditions.push(eq(payment_refunds.order_id, filters.order_id));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, total_row] = await Promise.all([
      db
        .select({
          id: payment_refunds.id,
          transaction_id: payment_refunds.transaction_id,
          order_id: payment_refunds.order_id,
          user_id: payment_refunds.user_id,
          invoice_id: payment_refunds.invoice_id,
          provider_refund_id: payment_refunds.provider_refund_id,
          provider_response: payment_refunds.provider_response,
          type: payment_refunds.type,
          status: payment_refunds.status,
          reason: payment_refunds.reason,
          approved_by: payment_refunds.approved_by,
          approved_at: payment_refunds.approved_at,
          currency: payment_refunds.currency,
          amount: payment_refunds.amount,
          fee_refunded: payment_refunds.fee_refunded,
          net_refunded: payment_refunds.net_refunded,
          sku_refunds: payment_refunds.sku_refunds,
          failure_reason: payment_refunds.failure_reason,
          metadata: payment_refunds.metadata,
          processed_at: payment_refunds.processed_at,
          created_at: payment_refunds.created_at,
          updated_at: payment_refunds.updated_at,
          order_number: orders.order_number,
          user_name: users.name,
          approver_name: sql`approver.name`,
        })
        .from(payment_refunds)
        .leftJoin(orders, eq(payment_refunds.order_id, orders.id))
        .leftJoin(users, eq(payment_refunds.user_id, users.id))
        .leftJoin(sql`${users} as approver`, eq(payment_refunds.approved_by, sql`approver.id`))
        .where(where)
        .orderBy(desc(payment_refunds.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(payment_refunds)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total_records: Number(total_row),
        total_pages: Math.ceil(Number(total_row) / limit),
        has_more: offset + limit < Number(total_row),
      },
    };
  }

  async get_refund_stats() {
    const [counts, amount, pending_approval] = await Promise.all([
      db
        .select({
          total: count(),
          completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
          pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
          failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
        })
        .from(payment_refunds)
        .then((r) => r[0] ?? null),
      db
        .select({
          total_amount: sum(payment_refunds.amount).as("total"),
          month_amount: sql<string>`COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END), 0)`,
        })
        .from(payment_refunds)
        .where(eq(payment_refunds.status, "completed"))
        .then((r) => r[0] ?? null),
      db
        .select({ count: count() })
        .from(payment_refunds)
        .where(eq(payment_refunds.status, "pending"))
        .then((r) => r[0]?.count ?? 0),
    ]);

    return {
      total_refunds: Number(counts?.total ?? 0),
      completed_refunds: Number(counts?.completed ?? 0),
      pending_refunds: Number(counts?.pending ?? 0),
      failed_refunds: Number(counts?.failed ?? 0),
      total_refunded_amount: Number(amount?.total_amount ?? 0),
      month_refunded_amount: Number(amount?.month_amount ?? 0),
      pending_approval_count: Number(pending_approval),
    };
  }

  // ─── Payouts ──────────────────────────────────────────

  async find_payout(id: string) {
    return await db
      .select()
      .from(payment_payouts)
      .where(eq(payment_payouts.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_payout_with_items(id: string) {
    const payout = await this.find_payout(id);
    if (!payout) return null;
    const items = await db
      .select()
      .from(payment_payout_items)
      .where(eq(payment_payout_items.payout_id, id));
    return { ...payout, items };
  }

  async create_payout(input: typeof payment_payouts.$inferInsert) {
    const [created] = await db.insert(payment_payouts).values(input).$returningId();
    return this.find_payout(created.id);
  }

  async update_payout(id: string, patch: Partial<typeof payment_payouts.$inferInsert>) {
    await db.update(payment_payouts).set(patch).where(eq(payment_payouts.id, id));
    return this.find_payout(id);
  }

  async create_payout_item(input: typeof payment_payout_items.$inferInsert) {
    await db.insert(payment_payout_items).values(input);
  }

  async list_payouts(
    page: number,
    limit: number,
    filters?: { status?: string; vendor_id?: string },
  ) {
    const offset = (Math.max(page, 1) - 1) * limit;
    const conditions = [];

    if (filters?.status) conditions.push(eq(payment_payouts.status, filters.status));
    if (filters?.vendor_id) conditions.push(eq(payment_payouts.vendor_id, filters.vendor_id));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, total_row] = await Promise.all([
      db
        .select()
        .from(payment_payouts)
        .where(where)
        .orderBy(desc(payment_payouts.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(payment_payouts)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total_records: Number(total_row),
        total_pages: Math.ceil(Number(total_row) / limit),
        has_more: offset + limit < Number(total_row),
      },
    };
  }

  async get_payout_stats() {
    const [counts, amounts] = await Promise.all([
      db
        .select({
          total: count(),
          pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
          completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
          failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
        })
        .from(payment_payouts)
        .then((r) => r[0] ?? null),
      db
        .select({
          total_gross: sum(payment_payouts.gross_amount).as("gross"),
          total_commission: sum(payment_payouts.commission_amount).as("commission"),
          total_net: sum(payment_payouts.net_amount).as("net"),
          pending_net: sql<string>`COALESCE(SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0 END), 0)`,
        })
        .from(payment_payouts)
        .then((r) => r[0] ?? null),
    ]);

    return {
      total_payouts: Number(counts?.total ?? 0),
      pending_payouts: Number(counts?.pending ?? 0),
      completed_payouts: Number(counts?.completed ?? 0),
      failed_payouts: Number(counts?.failed ?? 0),
      total_gross: Number(amounts?.total_gross ?? 0),
      total_commission: Number(amounts?.total_commission ?? 0),
      total_net: Number(amounts?.total_net ?? 0),
      pending_net: Number(amounts?.pending_net ?? 0),
    };
  }

  // ─── Audit Logs ──────────────────────────────────────────

  async create_audit_log(
    input: typeof payment_audit_logs.$inferInsert,
  ) {
    const [created] = await db.insert(payment_audit_logs).values(input).$returningId();
    return created.id;
  }

  async list_audit_logs(
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
    const offset = (Math.max(page, 1) - 1) * limit;
    const conditions = [];

    if (filters?.transaction_id)
      conditions.push(eq(payment_audit_logs.transaction_id, filters.transaction_id));
    if (filters?.refund_id)
      conditions.push(eq(payment_audit_logs.refund_id, filters.refund_id));
    if (filters?.action) conditions.push(eq(payment_audit_logs.action, filters.action));
    if (filters?.resource_type)
      conditions.push(eq(payment_audit_logs.resource_type, filters.resource_type));
    if (filters?.date_from)
      conditions.push(gte(payment_audit_logs.created_at, filters.date_from));
    if (filters?.date_to)
      conditions.push(lte(payment_audit_logs.created_at, filters.date_to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, total_row] = await Promise.all([
      db
        .select({
          id: payment_audit_logs.id,
          transaction_id: payment_audit_logs.transaction_id,
          refund_id: payment_audit_logs.refund_id,
          payout_id: payment_audit_logs.payout_id,
          order_id: payment_audit_logs.order_id,
          actor_user_id: payment_audit_logs.actor_user_id,
          action: payment_audit_logs.action,
          resource_type: payment_audit_logs.resource_type,
          resource_id: payment_audit_logs.resource_id,
          from_status: payment_audit_logs.from_status,
          to_status: payment_audit_logs.to_status,
          changes: payment_audit_logs.changes,
          metadata: payment_audit_logs.metadata,
          ip_address: payment_audit_logs.ip_address,
          user_agent: payment_audit_logs.user_agent,
          created_at: payment_audit_logs.created_at,
          actor_name: users.name,
        })
        .from(payment_audit_logs)
        .leftJoin(users, eq(payment_audit_logs.actor_user_id, users.id))
        .where(where)
        .orderBy(desc(payment_audit_logs.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(payment_audit_logs)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total_records: Number(total_row),
        total_pages: Math.ceil(Number(total_row) / limit),
        has_more: offset + limit < Number(total_row),
      },
    };
  }
}

export const payment_repository = new PaymentRepository();
