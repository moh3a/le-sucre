import "server-only";
import { db } from "@/lib/db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { notification_service } from "./notification.service";
import { admin_tasks } from "../schema";
import { NOTIFICATION_TYPES } from "../constants/notifications";

export class AdminTaskService {
  async create(input: {
    task_type: string;
    title: string;
    description?: string;
    reference_type?: string;
    reference_id?: string;
    assigned_to_user_id?: string;
    priority?: string;
    due_at?: string;
    created_by_user_id: string;
  }) {
    const [created] = await db
      .insert(admin_tasks)
      .values({
        id: generate_id(),
        task_type: input.task_type,
        title: input.title,
        description: input.description ?? null,
        reference_type: input.reference_type ?? null,
        reference_id: input.reference_id ?? null,
        assigned_to_user_id: input.assigned_to_user_id ?? null,
        status: "pending",
        priority: input.priority ?? "normal",
        due_at: input.due_at ?? null,
        created_by_user_id: input.created_by_user_id,
      })
      .$returningId();

    if (input.assigned_to_user_id) {
      void notification_service.notify({
        user_id: input.assigned_to_user_id,
        type: NOTIFICATION_TYPES.TASK_ASSIGNED,
        title: `Nouvelle tâche: ${input.title}`,
        reference_type: "task_id",
        reference_id: created.id,
      });
    }

    void audit_service.log({
      actor_user_id: input.created_by_user_id,
      action: "admin.task.create",
      resource_type: "task_id",
      resource_id: created.id,
    });

    return db.select().from(admin_tasks).where(eq(admin_tasks.id, created.id)).then((r) => r[0] ?? null);
  }

  async update(input: {
    id: string;
    title?: string;
    description?: string;
    priority?: string;
    due_at?: string;
    assigned_to_user_id?: string;
    updated_by_user_id: string;
  }) {
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.description !== undefined) patch.description = input.description;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.due_at !== undefined) patch.due_at = input.due_at;
    if (input.assigned_to_user_id !== undefined) patch.assigned_to_user_id = input.assigned_to_user_id;

    await db.update(admin_tasks).set(patch).where(eq(admin_tasks.id, input.id));

    void audit_service.log({
      actor_user_id: input.updated_by_user_id,
      action: "admin.task.update",
      resource_type: "task_id",
      resource_id: input.id,
    });
  }

  async assign(input: { id: string; assigned_to_user_id: string; assigned_by_user_id: string }) {
    await db
      .update(admin_tasks)
      .set({ assigned_to_user_id: input.assigned_to_user_id, status: "pending" })
      .where(eq(admin_tasks.id, input.id));

    void notification_service.notify({
      user_id: input.assigned_to_user_id,
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      reference_type: "task_id",
      reference_id: input.id,
    });

    void audit_service.log({
      actor_user_id: input.assigned_by_user_id,
      action: "admin.task.assign",
      resource_type: "task_id",
      resource_id: input.id,
    });
  }

  async start_task(input: { id: string; user_id: string }) {
    await db
      .update(admin_tasks)
      .set({ status: "in_progress" })
      .where(and(eq(admin_tasks.id, input.id), eq(admin_tasks.assigned_to_user_id, input.user_id)));
  }

  async complete(input: { id: string; completion_notes?: string; completed_by_user_id: string }) {
    const task = await db.select().from(admin_tasks).where(eq(admin_tasks.id, input.id)).limit(1).then((r) => r[0] ?? null);
    if (!task) throw new Error("Task not found");

    await db
      .update(admin_tasks)
      .set({
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by_user_id: input.completed_by_user_id,
        completion_notes: input.completion_notes ?? null,
      })
      .where(eq(admin_tasks.id, input.id));

    void audit_service.log({
      actor_user_id: input.completed_by_user_id,
      action: "admin.task.complete",
      resource_type: "task_id",
      resource_id: input.id,
    });
  }

  async cancel(input: { id: string; cancelled_by_user_id: string }) {
    await db
      .update(admin_tasks)
      .set({ status: "cancelled", completed_by_user_id: input.cancelled_by_user_id, completed_at: new Date().toISOString() })
      .where(eq(admin_tasks.id, input.id));
  }

  async get(id: string) {
    const task = await db.select().from(admin_tasks).where(eq(admin_tasks.id, id)).limit(1).then((r) => r[0] ?? null);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async list_for_user(user_id: string, status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const where = status
      ? and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, status))
      : eq(admin_tasks.assigned_to_user_id, user_id);
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
    return db
      .select()
      .from(admin_tasks)
      .where(
        and(
          eq(admin_tasks.status, "pending"),
          sql`${admin_tasks.due_at} IS NOT NULL`,
          sql`${admin_tasks.due_at} < NOW()`,
        ),
      )
      .orderBy(admin_tasks.due_at);
  }

  async get_dashboard_stats(user_id: string) {
    const [pending, in_progress, overdue, completed] = await Promise.all([
      db
        .select({ count: count() })
        .from(admin_tasks)
        .where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "pending")))
        .then((r) => Number(r[0]?.count ?? 0)),
      db
        .select({ count: count() })
        .from(admin_tasks)
        .where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "in_progress")))
        .then((r) => Number(r[0]?.count ?? 0)),
      db
        .select({ count: count() })
        .from(admin_tasks)
        .where(
          and(
            eq(admin_tasks.assigned_to_user_id, user_id),
            eq(admin_tasks.status, "pending"),
            sql`${admin_tasks.due_at} IS NOT NULL`,
            sql`${admin_tasks.due_at} < NOW()`,
          ),
        )
        .then((r) => Number(r[0]?.count ?? 0)),
      db
        .select({ count: count() })
        .from(admin_tasks)
        .where(and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "completed")))
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);
    return { pending, in_progress, overdue, completed };
  }
}

export const admin_task_service = new AdminTaskService();
