import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";

export const admin_tasks = mysqlTable(
  "admin_tasks",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    task_type: varchar("task_type", { length: 32 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    reference_type: varchar("reference_type", { length: 32 }),
    reference_id: varchar("reference_id", { length: 255 }),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    due_at: timestamp("due_at", { mode: "string" }),
    completed_at: timestamp("completed_at", { mode: "string" }),
    completed_by_user_id: varchar("completed_by_user_id", { length: 255 }),
    completion_notes: text("completion_notes"),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("admin_tasks_assigned_idx").on(t.assigned_to_user_id, t.status),
    index("admin_tasks_type_status_idx").on(t.task_type, t.status),
    index("admin_tasks_due_idx").on(t.due_at, t.status),
    index("admin_tasks_reference_idx").on(t.reference_type, t.reference_id),
  ],
);
