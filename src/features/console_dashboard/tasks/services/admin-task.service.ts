import "server-only";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { admin_task_repository as repo } from "../repositories/admin-task.repository";
import { admin_tasks } from "../schema";
import { build_task_id } from "../task-id.helper";
import { notification_service } from "@/features/console_dashboard/notifications/services/notification.service";
import { NOTIFICATION_TYPES } from "@/features/console_dashboard/notifications/constants/notifications";
import { apply_completion_side_effect } from "./task-side-effects.service";
import { TASK_TYPES_WITH_COMPLETION_EFFECT } from "../constants/task-types";
import { logger } from "@/lib/logger";

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
    created_by_user_id?: string | null;
  }) {
    const [created] = await db
      .insert(admin_tasks)
      .values({
        id: await build_task_id(),
        task_type: input.task_type,
        title: input.title,
        description: input.description ?? null,
        reference_type: input.reference_type ?? null,
        reference_id: input.reference_id ?? null,
        assigned_to_user_id: input.assigned_to_user_id ?? null,
        status: "pending",
        priority: input.priority ?? "normal",
        due_at: input.due_at ?? null,
        created_by_user_id: input.created_by_user_id ?? null,
      })
      .$returningId();

    if (input.assigned_to_user_id) {
      await this.notify_assignment({
        task_id: created.id,
        title: input.title,
        assigned_to_user_id: input.assigned_to_user_id,
        reference_type: input.reference_type,
        reference_id: input.reference_id,
      });
    }

    return db
      .select()
      .from(admin_tasks)
      .where(eq(admin_tasks.id, created.id))
      .then((r) => r[0] ?? null);
  }

  async auto_create(input: {
    task_type: string;
    title: string;
    description?: string;
    reference_type?: string;
    reference_id?: string;
    created_by_user_id?: string | null;
  }) {
    const existing = await repo.find_active_by_reference(
      input.task_type,
      input.reference_type,
      input.reference_id,
    );
    if (existing) return;
    await this.create(input);
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
    if (input.assigned_to_user_id !== undefined)
      patch.assigned_to_user_id = input.assigned_to_user_id;
    await db.update(admin_tasks).set(patch).where(eq(admin_tasks.id, input.id));
  }

  async assign(input: { id: string; assigned_to_user_id: string; assigned_by_user_id: string }) {
    await db
      .update(admin_tasks)
      .set({ assigned_to_user_id: input.assigned_to_user_id, status: "pending" })
      .where(eq(admin_tasks.id, input.id));

    const task = await repo.find_by_id(input.id);
    if (task) {
      await this.notify_assignment({
        task_id: task.id,
        title: task.title,
        assigned_to_user_id: input.assigned_to_user_id,
        reference_type: task.reference_type ?? undefined,
        reference_id: task.reference_id ?? undefined,
      });
    }
  }

  async start_task(input: { id: string; user_id: string }) {
    await db.update(admin_tasks).set({ status: "in_progress" }).where(eq(admin_tasks.id, input.id));
  }

  async complete(input: { id: string; completion_notes?: string; completed_by_user_id: string }) {
    const task = await db
      .select()
      .from(admin_tasks)
      .where(eq(admin_tasks.id, input.id))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!task) throw new Error("Task not found");
    if (task.status === "completed") return task;

    if (TASK_TYPES_WITH_COMPLETION_EFFECT.has(task.task_type)) {
      await apply_completion_side_effect(task, input.completed_by_user_id);
    }

    await db
      .update(admin_tasks)
      .set({
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by_user_id: input.completed_by_user_id,
        completion_notes: input.completion_notes ?? null,
      })
      .where(eq(admin_tasks.id, input.id));
    return task;
  }

  async cancel(input: { id: string; cancelled_by_user_id: string }) {
    await db
      .update(admin_tasks)
      .set({
        status: "cancelled",
        completed_by_user_id: input.cancelled_by_user_id,
        completed_at: new Date().toISOString(),
      })
      .where(eq(admin_tasks.id, input.id));
  }

  async get(id: string) {
    const task = await db
      .select()
      .from(admin_tasks)
      .where(eq(admin_tasks.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async list_for_user(user_id: string, status?: string, task_type?: string, page = 1, limit = 20) {
    return repo.list_for_user(user_id, status, task_type, page, limit);
  }

  async list_all(status?: string, task_type?: string, assignee_id?: string, page = 1, limit = 20) {
    return repo.list_all(status, task_type, assignee_id, page, limit);
  }

  async get_overdue() {
    return repo.get_overdue();
  }

  async get_dashboard_stats(user_id: string) {
    return repo.get_dashboard_stats(user_id);
  }

  async team_workload() {
    return repo.team_workload();
  }

  private async notify_assignment(input: {
    task_id: string;
    title: string;
    assigned_to_user_id: string;
    reference_type?: string;
    reference_id?: string;
  }) {
    await notification_service.notify({
      user_id: input.assigned_to_user_id,
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: input.title,
      reference_type: input.reference_type,
      reference_id: input.reference_id,
    });
  }
}

export const admin_task_service = new AdminTaskService();

export function dispatch_task_creation(
  input: Parameters<AdminTaskService["auto_create"]>[0],
) {
  void admin_task_service.auto_create(input).catch((err) => {
    logger.error("task_auto_creation_failed", {
      task_type: input.task_type,
      reference_type: input.reference_type,
      reference_id: input.reference_id,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}
