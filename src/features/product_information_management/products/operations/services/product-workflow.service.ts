import "server-only";
import { db } from "@/lib/db";
import { eq, and, desc, count } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { products } from "@/features/product_information_management/products/schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { product_change_log, product_publishing_schedule } from "../schema";

export class ProductWorkflowService {
  async log_change(input: { product_id: string; change_type: string; field_name: string; old_value?: string; new_value?: string; changed_by_user_id?: string; notes?: string }) {
    const [created] = await db.insert(product_change_log).values({ id: generate_id(), product_id: input.product_id, change_type: input.change_type, field_name: input.field_name, old_value: input.old_value ?? null, new_value: input.new_value ?? null, changed_by_user_id: input.changed_by_user_id ?? null, notes: input.notes ?? null }).$returningId();
    return created.id;
  }

  async get_change_history(product_id: string, change_type?: string) {
    const where = change_type ? and(eq(product_change_log.product_id, product_id), eq(product_change_log.change_type, change_type)) : eq(product_change_log.product_id, product_id);
    return db.select().from(product_change_log).where(where).orderBy(desc(product_change_log.created_at));
  }

  async schedule_publishing(input: { product_id: string; action: "publish" | "unpublish"; scheduled_at: string; created_by_user_id: string }) {
    const [created] = await db.insert(product_publishing_schedule).values({ id: generate_id(), product_id: input.product_id, action: input.action, scheduled_at: input.scheduled_at, status: "pending", created_by_user_id: input.created_by_user_id }).$returningId();
    return db.select().from(product_publishing_schedule).where(eq(product_publishing_schedule.id, created.id)).then((r) => r[0] ?? null);
  }

  async cancel_schedule(input: { schedule_id: string; cancelled_by_user_id: string; reason?: string }) {
    await db.update(product_publishing_schedule).set({ status: "cancelled", cancelled_by_user_id: input.cancelled_by_user_id, cancel_reason: input.reason ?? null }).where(eq(product_publishing_schedule.id, input.schedule_id));
  }

  async get_scheduled_actions(product_id?: string) {
    if (product_id) return db.select().from(product_publishing_schedule).where(and(eq(product_publishing_schedule.product_id, product_id), eq(product_publishing_schedule.status, "pending"))).orderBy(product_publishing_schedule.scheduled_at);
    return db.select().from(product_publishing_schedule).where(eq(product_publishing_schedule.status, "pending")).orderBy(product_publishing_schedule.scheduled_at);
  }

  async list_scheduled_actions(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(product_publishing_schedule.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(product_publishing_schedule).where(where).orderBy(desc(product_publishing_schedule.scheduled_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(product_publishing_schedule).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_schedule_stats() {
    const [[{ pending }], [{ executed }], [{ failed }], [{ cancelled }]] = await Promise.all([
      db.select({ pending: count() }).from(product_publishing_schedule).where(eq(product_publishing_schedule.status, "pending")),
      db.select({ executed: count() }).from(product_publishing_schedule).where(eq(product_publishing_schedule.status, "executed")),
      db.select({ failed: count() }).from(product_publishing_schedule).where(eq(product_publishing_schedule.status, "failed")),
      db.select({ cancelled: count() }).from(product_publishing_schedule).where(eq(product_publishing_schedule.status, "cancelled")),
    ]);
    return { pending: Number(pending ?? 0), executed: Number(executed ?? 0), failed: Number(failed ?? 0), cancelled: Number(cancelled ?? 0) };
  }

  async execute_pending_schedules() {
    const pending = await db.select().from(product_publishing_schedule).where(and(eq(product_publishing_schedule.status, "pending")));
    for (const schedule of pending) {
      if (new Date(schedule.scheduled_at) > new Date()) continue;
      try {
        const new_status = schedule.action === "publish" ? "published" : "archived";
        await db.update(products).set({ status: new_status }).where(eq(products.id, schedule.product_id));
        await db.update(product_publishing_schedule).set({ status: "executed", executed_at: new Date().toISOString() }).where(eq(product_publishing_schedule.id, schedule.id));
      } catch {
        await db.update(product_publishing_schedule).set({ status: "failed" }).where(eq(product_publishing_schedule.id, schedule.id));
      }
    }
  }
}

export const product_workflow_service = new ProductWorkflowService();
