import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export const product_change_log = mysqlTable(
  "product_change_log",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    change_type: varchar("change_type", { length: 32 }).notNull(),
    field_name: varchar("field_name", { length: 64 }).notNull(),
    old_value: text("old_value"),
    new_value: text("new_value"),
    changed_by_user_id: varchar("changed_by_user_id", { length: 255 }),
    notes: varchar("notes", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("product_change_log_product_idx").on(t.product_id, t.created_at),
    index("product_change_log_type_idx").on(t.change_type),
  ],
);

export const product_publishing_schedule = mysqlTable(
  "product_publishing_schedule",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 32 }).notNull(),
    scheduled_at: timestamp("scheduled_at", { mode: "string" }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    executed_at: timestamp("executed_at", { mode: "string" }),
    cancelled_by_user_id: varchar("cancelled_by_user_id", { length: 255 }),
    cancel_reason: varchar("cancel_reason", { length: 512 }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("product_publishing_schedule_product_idx").on(t.product_id),
    index("product_publishing_schedule_status_idx").on(t.status, t.scheduled_at),
  ],
);
