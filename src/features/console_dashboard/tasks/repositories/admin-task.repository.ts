import "server-only";
import { db } from "@/lib/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { admin_tasks } from "../schema";

export class AdminTaskRepository {
  async create(input: typeof admin_tasks.$inferInsert) {
    const [created] = await db.insert(admin_tasks).values(input).$returningId();
    return created.id;
  }

  async update(id: string, patch: Partial<typeof admin_tasks.$inferInsert>) {
    await db.update(admin_tasks).set(patch).where(eq(admin_tasks.id, id));
  }

  async find_by_id(id: string) {
    return db.select().from(admin_tasks).where(eq(admin_tasks.id, id)).limit(1).then((r) => r[0] ?? null);
  }

  async list_for_user(user_id: string, status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const where = status ? and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, status)) : eq(admin_tasks.assigned_to_user_id, user_id);
    const [items, [{ total }]] = await Promise.all([
      db.select().from(admin_tasks).where(where).orderBy(desc(admin_tasks.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(admin_tasks).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async list_all(status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const where = status ? eq(admin_tasks.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(admin_tasks).where(where).orderBy(desc(admin_tasks.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(admin_tasks).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_overdue() {
    return db.select().from(admin_tasks).where(and(eq(admin_tasks.status, "pending"), sql`${admin_tasks.due_at} IS NOT NULL`, sql`${admin_tasks.due_at} < NOW()`)).orderBy(admin_tasks.due_at);
  }

  async get_dashboard_stats(user_id: string) {
    const [pending, in_progress, overdue, completed] = await Promise.all([
      db.select({ count: count() }).from(admin_tasks).where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "pending"))).then((r) => Number(r[0]?.count ?? 0)),
      db.select({ count: count() }).from(admin_tasks).where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "in_progress"))).then((r) => Number(r[0]?.count ?? 0)),
      db.select({ count: count() }).from(admin_tasks).where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "pending"), sql`${admin_tasks.due_at} IS NOT NULL`, sql`${admin_tasks.due_at} < NOW()`)).then((r) => Number(r[0]?.count ?? 0)),
      db.select({ count: count() }).from(admin_tasks).where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "completed"))).then((r) => Number(r[0]?.count ?? 0)),
    ]);
    return { pending, in_progress, overdue, completed };
  }
}

export const admin_task_repository = new AdminTaskRepository();
