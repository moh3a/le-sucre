import "server-only";
import { db } from "@/lib/db";
import { eq, desc, count } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";
import { payment_verifications, refund_requests, partial_payments } from "../schema";

export class PaymentOperationsService {
  async create_verification(input: { order_id: string; amount: number; currency?: string; reference_number?: string; proof_url?: string; notes?: string; created_by_user_id: string }) {
    const [created] = await db.insert(payment_verifications).values({ id: generate_id(), order_id: input.order_id, verification_type: "manual", status: "pending", amount: String(input.amount), currency: input.currency ?? "DZD", reference_number: input.reference_number ?? null, proof_url: input.proof_url ?? null, notes: input.notes ?? null, created_by_user_id: input.created_by_user_id }).$returningId();
    return db.select().from(payment_verifications).where(eq(payment_verifications.id, created.id)).then((r) => r[0] ?? null);
  }

  async verify_payment(input: { id: string; status: "verified" | "rejected"; verified_by_user_id: string; rejection_reason?: string }) {
    const verification = await db.select().from(payment_verifications).where(eq(payment_verifications.id, input.id)).limit(1).then((r) => r[0] ?? null);
    if (!verification) throw new Error("Verification not found");
    await db.update(payment_verifications).set({ status: input.status, verified_by_user_id: input.verified_by_user_id, verified_at: new Date().toISOString(), ...(input.rejection_reason ? { rejection_reason: input.rejection_reason } : {}) }).where(eq(payment_verifications.id, input.id));
    if (input.status === "verified") {
      await order_repository.update_order_payment(verification.order_id, { payment_status: "paid", payment_reference: verification.reference_number });
      await order_repository.update_order_status(verification.order_id, "confirmed");
    }
  }

  async list_verifications(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(payment_verifications.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(payment_verifications).where(where).orderBy(desc(payment_verifications.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(payment_verifications).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async count_pending() {
    const [{ count: total }] = await db.select({ count: count() }).from(payment_verifications).where(eq(payment_verifications.status, "pending"));
    return Number(total ?? 0);
  }

  async request_refund(input: { order_id: string; amount: number; reason: string; return_request_id?: string; cancellation_request_id?: string; requested_by_user_id: string }) {
    const [created] = await db.insert(refund_requests).values({ id: generate_id(), order_id: input.order_id, return_request_id: input.return_request_id ?? null, cancellation_request_id: input.cancellation_request_id ?? null, status: "pending", amount: String(input.amount), reason: input.reason, requested_by_user_id: input.requested_by_user_id }).$returningId();
    return db.select().from(refund_requests).where(eq(refund_requests.id, created.id)).then((r) => r[0] ?? null);
  }

  async approve_refund(input: { id: string; approved_by_user_id: string; refund_method?: string }) {
    await db.update(refund_requests).set({ status: "approved", approved_by_user_id: input.approved_by_user_id, approved_at: new Date().toISOString(), refund_method: input.refund_method ?? null }).where(eq(refund_requests.id, input.id));
  }

  async process_refund(input: { id: string; processed_by_user_id: string; provider_reference?: string; status?: "completed" | "failed" }) {
    const refund = await db.select().from(refund_requests).where(eq(refund_requests.id, input.id)).limit(1).then((r) => r[0] ?? null);
    if (!refund) throw new Error("Refund request not found");
    await db.update(refund_requests).set({ status: input.status ?? "completed", processed_by_user_id: input.processed_by_user_id, processed_at: new Date().toISOString(), provider_reference: input.provider_reference ?? null }).where(eq(refund_requests.id, input.id));
    if (input.status !== "failed") await order_repository.update_order_payment(refund.order_id, { payment_status: "refunded" });
  }

  async list_refund_requests(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(refund_requests.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(refund_requests).where(where).orderBy(desc(refund_requests.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(refund_requests).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_refund_by_order(order_id: string) {
    return db.select().from(refund_requests).where(eq(refund_requests.order_id, order_id)).orderBy(desc(refund_requests.created_at));
  }

  async record_partial_payment(input: { order_id: string; payment_number: number; type: string; amount: number; currency?: string; payment_method?: string; payment_reference?: string; notes?: string }) {
    const [created] = await db.insert(partial_payments).values({ id: generate_id(), order_id: input.order_id, payment_number: input.payment_number, type: input.type, amount: String(input.amount), currency: input.currency ?? "DZD", status: "paid", paid_at: new Date().toISOString(), payment_method: input.payment_method ?? null, payment_reference: input.payment_reference ?? null, notes: input.notes ?? null }).$returningId();
    await order_repository.update_order_payment(input.order_id, { payment_status: "partially_paid" });
    return db.select().from(partial_payments).where(eq(partial_payments.id, created.id)).then((r) => r[0] ?? null);
  }

  async get_partial_payments(order_id: string) {
    return db.select().from(partial_payments).where(eq(partial_payments.order_id, order_id)).orderBy(partial_payments.payment_number);
  }

  async check_deposit_completed(order_id: string) {
    const payments = await this.get_partial_payments(order_id);
    const total_deposit = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);
    const order = await order_repository.find_by_id(order_id);
    if (!order) return { is_completed: false, total_paid: total_deposit, total_required: 0 };
    const total_required = Number(order.grand_total);
    if (total_deposit >= total_required) {
      await order_repository.update_order_payment(order_id, { payment_status: "paid" });
      return { is_completed: true, total_paid: total_deposit, total_required };
    }
    return { is_completed: false, total_paid: total_deposit, total_required };
  }
}

export const payment_operations_service = new PaymentOperationsService();
