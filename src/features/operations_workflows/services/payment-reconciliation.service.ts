import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { payment_reconciliation } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class PaymentReconciliationService {
  async create_entry(input: {
    order_id: string;
    transaction_reference?: string;
    bank_reference?: string;
    amount: number;
    fee?: number;
    payment_method?: string;
  }) {
    const fee = input.fee ?? 0;
    const id = generate_id();
    await db.insert(payment_reconciliation).values({
      id,
      order_id: input.order_id,
      transaction_reference: input.transaction_reference ?? null,
      bank_reference: input.bank_reference ?? null,
      amount: String(input.amount),
      fee: String(fee),
      net_amount: String(input.amount - fee),
      payment_method: input.payment_method ?? null,
      status: "unmatched",
    });
    return this.get(id);
  }

  async match(input: {
    id: string;
    user_id: string;
    transaction_reference?: string;
    bank_reference?: string;
    notes?: string;
  }) {
    await db
      .update(payment_reconciliation)
      .set({
        status: "matched",
        matched_at: sql`NOW()`,
        matched_by_user_id: input.user_id,
        transaction_reference: input.transaction_reference ?? undefined,
        bank_reference: input.bank_reference ?? undefined,
        notes: input.notes ?? undefined,
      })
      .where(eq(payment_reconciliation.id, input.id));

    void audit_service.log({
      action: "payment_reconciliation.matched",
      resource_type: "payment_reconciliation_id",
      resource_id: input.id,
    });

    return this.get(input.id);
  }

  async flag_discrepancy(id: string, notes: string) {
    await db
      .update(payment_reconciliation)
      .set({ status: "discrepancy", notes })
      .where(eq(payment_reconciliation.id, id));
    return this.get(id);
  }

  async get(id: string) {
    const [row] = await db.select().from(payment_reconciliation).where(eq(payment_reconciliation.id, id)).limit(1);
    return row ?? null;
  }

  async list(status?: string, order_id?: string) {
    const clauses: any[] = [];
    if (status) clauses.push(eq(payment_reconciliation.status, status));
    if (order_id) clauses.push(eq(payment_reconciliation.order_id, order_id));
    return db
      .select()
      .from(payment_reconciliation)
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(payment_reconciliation.created_at));
  }

  async get_stats() {
    const [matched, unmatched, discrepancy] = await Promise.all([
      db.select({ count: sql<number>`count(*)`, total: sql<string>`COALESCE(SUM(CAST(net_amount AS DECIMAL(14,2))), 0)` }).from(payment_reconciliation).where(eq(payment_reconciliation.status, "matched")),
      db.select({ count: sql<number>`count(*)`, total: sql<string>`COALESCE(SUM(CAST(net_amount AS DECIMAL(14,2))), 0)` }).from(payment_reconciliation).where(eq(payment_reconciliation.status, "unmatched")),
      db.select({ count: sql<number>`count(*)` }).from(payment_reconciliation).where(eq(payment_reconciliation.status, "discrepancy")),
    ]);

    return {
      matched: { count: Number(matched[0]?.count ?? 0), total: matched[0]?.total ?? "0" },
      unmatched: { count: Number(unmatched[0]?.count ?? 0), total: unmatched[0]?.total ?? "0" },
      discrepancies: Number(discrepancy[0]?.count ?? 0),
    };
  }
}

export const payment_reconciliation_service = new PaymentReconciliationService();
