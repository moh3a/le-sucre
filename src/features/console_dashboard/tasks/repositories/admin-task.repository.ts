import "server-only";
import { db } from "@/lib/db";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { admin_tasks } from "../schema";
import {
  users,
  user_roles,
  roles,
} from "@/features/authentication_and_authorization/auth/schema";
import { STAFF_ROLES } from "@/features/authentication_and_authorization/authorization/constants/roles";

const creator = alias(users, "creator");

type ListOptions = {
  assignee_id?: string;
  status?: string;
  task_type?: string;
  page?: number;
  limit?: number;
};

const tasks_select = {
  id: admin_tasks.id,
  task_type: admin_tasks.task_type,
  title: admin_tasks.title,
  description: admin_tasks.description,
  reference_type: admin_tasks.reference_type,
  reference_id: admin_tasks.reference_id,
  assigned_to_user_id: admin_tasks.assigned_to_user_id,
  assignee_name: users.name,
  status: admin_tasks.status,
  priority: admin_tasks.priority,
  due_at: admin_tasks.due_at,
  completed_at: admin_tasks.completed_at,
  completed_by_user_id: admin_tasks.completed_by_user_id,
  completion_notes: admin_tasks.completion_notes,
  created_by_user_id: admin_tasks.created_by_user_id,
  creator_name: creator.name,
  created_at: admin_tasks.created_at,
  updated_at: admin_tasks.updated_at,
};

function build_where(opts: ListOptions) {
  const conditions = [];
  if (opts.assignee_id) conditions.push(eq(admin_tasks.assigned_to_user_id, opts.assignee_id));
  if (opts.status) conditions.push(eq(admin_tasks.status, opts.status));
  if (opts.task_type) conditions.push(eq(admin_tasks.task_type, opts.task_type));
  return conditions.length ? and(...conditions) : undefined;
}

export class AdminTaskRepository {
  async create(input: typeof admin_tasks.$inferInsert) {
    const [created] = await db.insert(admin_tasks).values(input).$returningId();
    return created.id;
  }

  async update(id: string, patch: Partial<typeof admin_tasks.$inferInsert>) {
    await db.update(admin_tasks).set(patch).where(eq(admin_tasks.id, id));
  }

  async find_by_id(id: string) {
    return db
      .select()
      .from(admin_tasks)
      .where(eq(admin_tasks.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_active_by_reference(
    task_type: string,
    reference_type: string | null | undefined,
    reference_id: string | null | undefined,
  ) {
    if (!reference_type || !reference_id) return null;
    return db
      .select({ id: admin_tasks.id })
      .from(admin_tasks)
      .where(
        and(
          eq(admin_tasks.task_type, task_type),
          eq(admin_tasks.reference_type, reference_type),
          eq(admin_tasks.reference_id, reference_id),
          inArray(admin_tasks.status, ["pending", "in_progress"]),
        ),
      )
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async list(opts: ListOptions = {}) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
    const offset = (page - 1) * limit;
    const where = build_where(opts);

    const [items, total_row] = await Promise.all([
      db
        .select(tasks_select)
        .from(admin_tasks)
        .leftJoin(users, eq(users.id, admin_tasks.assigned_to_user_id))
        .leftJoin(creator, eq(creator.id, admin_tasks.created_by_user_id))
        .where(where)
        .orderBy(desc(admin_tasks.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(admin_tasks).where(where),
    ]);

    const total_records = Number(total_row[0]?.total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.ceil(total_records / limit) || 1,
      },
    };
  }

  async list_for_user(user_id: string, status?: string, task_type?: string, page = 1, limit = 20) {
    return this.list({ assignee_id: user_id, status, task_type, page, limit });
  }

  async list_all(status?: string, task_type?: string, assignee_id?: string, page = 1, limit = 20) {
    return this.list({ status, task_type, assignee_id, page, limit });
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
        .where(
          and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "in_progress")),
        )
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
        .where(
          and(eq(admin_tasks.assigned_to_user_id, user_id), eq(admin_tasks.status, "completed")),
        )
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);
    return { pending, in_progress, overdue, completed };
  }

  async team_workload() {
    const active_count = sql`COALESCE(SUM(CASE WHEN ${admin_tasks.status} IN ('pending', 'in_progress') THEN 1 ELSE 0 END), 0)`;

    const rows = await db
      .select({
        user_id: users.id,
        name: users.name,
        email: users.email,
        pending: sql<number>`COALESCE(SUM(CASE WHEN ${admin_tasks.status} = 'pending' AND (${admin_tasks.due_at} IS NULL OR ${admin_tasks.due_at} >= NOW()) THEN 1 ELSE 0 END), 0)`.mapWith(
          Number,
        ),
        in_progress: sql<number>`COALESCE(SUM(CASE WHEN ${admin_tasks.status} = 'in_progress' THEN 1 ELSE 0 END), 0)`.mapWith(
          Number,
        ),
        overdue: sql<number>`COALESCE(SUM(CASE WHEN ${admin_tasks.status} = 'pending' AND ${admin_tasks.due_at} IS NOT NULL AND ${admin_tasks.due_at} < NOW() THEN 1 ELSE 0 END), 0)`.mapWith(
          Number,
        ),
        completed: sql<number>`COALESCE(SUM(CASE WHEN ${admin_tasks.status} = 'completed' THEN 1 ELSE 0 END), 0)`.mapWith(
          Number,
        ),
        cancelled: sql<number>`COALESCE(SUM(CASE WHEN ${admin_tasks.status} = 'cancelled' THEN 1 ELSE 0 END), 0)`.mapWith(
          Number,
        ),
      })
      .from(users)
      .leftJoin(admin_tasks, eq(admin_tasks.assigned_to_user_id, users.id))
      .innerJoin(user_roles, eq(user_roles.user_id, users.id))
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(inArray(roles.name, STAFF_ROLES))
      .groupBy(users.id, users.name, users.email)
      .orderBy(desc(active_count));

    return rows.map((row) => ({
      ...row,
      active: row.pending + row.in_progress + row.overdue,
    }));
  }
}

export const admin_task_repository = new AdminTaskRepository();
