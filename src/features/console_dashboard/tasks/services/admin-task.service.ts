import "server-only";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { admin_task_repository as repo } from "../repositories/admin-task.repository";
import { admin_tasks } from "../schema";

export class AdminTaskService {
  async create(input: { task_type: string; title: string; description?: string; reference_type?: string; reference_id?: string; assigned_to_user_id?: string; priority?: string; due_at?: string; created_by_user_id: string }) {
    const [created] = await db.insert(admin_tasks).values({ id: generate_id(), task_type: input.task_type, title: input.title, description: input.description ?? null, reference_type: input.reference_type ?? null, reference_id: input.reference_id ?? null, assigned_to_user_id: input.assigned_to_user_id ?? null, status: "pending", priority: input.priority ?? "normal", due_at: input.due_at ?? null, created_by_user_id: input.created_by_user_id }).$returningId();
    return db.select().from(admin_tasks).where(eq(admin_tasks.id, created.id)).then((r) => r[0] ?? null);
  }

  async update(input: { id: string; title?: string; description?: string; priority?: string; due_at?: string; assigned_to_user_id?: string; updated_by_user_id: string }) {
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.description !== undefined) patch.description = input.description;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.due_at !== undefined) patch.due_at = input.due_at;
    if (input.assigned_to_user_id !== undefined) patch.assigned_to_user_id = input.assigned_to_user_id;
    await db.update(admin_tasks).set(patch).where(eq(admin_tasks.id, input.id));
  }

  async assign(input: { id: string; assigned_to_user_id: string; assigned_by_user_id: string }) {
    await db.update(admin_tasks).set({ assigned_to_user_id: input.assigned_to_user_id, status: "pending" }).where(eq(admin_tasks.id, input.id));
  }

  async start_task(input: { id: string; user_id: string }) {
    await db.update(admin_tasks).set({ status: "in_progress" }).where(eq(admin_tasks.id, input.id));
  }

  async complete(input: { id: string; completion_notes?: string; completed_by_user_id: string }) {
    const task = await db.select().from(admin_tasks).where(eq(admin_tasks.id, input.id)).limit(1).then((r) => r[0] ?? null);
    if (!task) throw new Error("Task not found");
    await db.update(admin_tasks).set({ status: "completed", completed_at: new Date().toISOString(), completed_by_user_id: input.completed_by_user_id, completion_notes: input.completion_notes ?? null }).where(eq(admin_tasks.id, input.id));
  }

  async cancel(input: { id: string; cancelled_by_user_id: string }) {
    await db.update(admin_tasks).set({ status: "cancelled", completed_by_user_id: input.cancelled_by_user_id, completed_at: new Date().toISOString() }).where(eq(admin_tasks.id, input.id));
  }

  async get(id: string) {
    const task = await db.select().from(admin_tasks).where(eq(admin_tasks.id, id)).limit(1).then((r) => r[0] ?? null);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async list_for_user(user_id: string, status?: string, page = 1, limit = 20) { return repo.list_for_user(user_id, status, page, limit); }

  async list_all(status?: string, page = 1, limit = 20) { return repo.list_all(status, page, limit); }

  async get_overdue() { return repo.get_overdue(); }

  async get_dashboard_stats(user_id: string) { return repo.get_dashboard_stats(user_id); }
}

export const admin_task_service = new AdminTaskService();
