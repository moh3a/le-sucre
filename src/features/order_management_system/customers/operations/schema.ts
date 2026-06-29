import {
  boolean,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { orders } from "@/features/order_management_system/orders/schema";

export const customer_contacts = mysqlTable(
  "customer_contacts",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, { onDelete: "set null" }),
    contact_type: varchar("contact_type", { length: 32 }).notNull(),
    direction: varchar("direction", { length: 16 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    summary: text("summary"),
    duration_seconds: int("duration_seconds"),
    handled_by_user_id: varchar("handled_by_user_id", { length: 255 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("customer_contacts_user_idx").on(t.user_id, t.created_at),
    index("customer_contacts_order_idx").on(t.order_id),
    index("customer_contacts_handled_by_idx").on(t.handled_by_user_id),
  ],
);

export const customer_notes = mysqlTable(
  "customer_notes",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    note_type: varchar("note_type", { length: 32 }).notNull().default("private"),
    content: text("content").notNull(),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    is_pinned: boolean("is_pinned").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("customer_notes_user_idx").on(t.user_id, t.created_at),
    index("customer_notes_created_by_idx").on(t.created_by_user_id),
  ],
);

export const customer_follow_ups = mysqlTable(
  "customer_follow_ups",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, { onDelete: "set null" }),
    follow_up_type: varchar("follow_up_type", { length: 32 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    scheduled_at: timestamp("scheduled_at", { mode: "string" }).notNull(),
    completed_at: timestamp("completed_at", { mode: "string" }),
    completed_by_user_id: varchar("completed_by_user_id", { length: 255 }),
    result_notes: text("result_notes"),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("customer_follow_ups_user_idx").on(t.user_id),
    index("customer_follow_ups_assigned_idx").on(t.assigned_to_user_id, t.status),
    index("customer_follow_ups_schedule_idx").on(t.scheduled_at, t.status),
  ],
);

export const customer_support_cases = mysqlTable(
  "customer_support_cases",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, { onDelete: "set null" }),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 64 }).notNull().default("general"),
    source: varchar("source", { length: 32 }).notNull().default("internal"),
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    status: varchar("status", { length: 32 }).notNull().default("open"),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    resolution: text("resolution"),
    resolved_by_user_id: varchar("resolved_by_user_id", { length: 255 }),
    resolved_at: timestamp("resolved_at", { mode: "string" }),
    reopened_count: int("reopened_count").notNull().default(0),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("customer_support_cases_user_idx").on(t.user_id, t.created_at),
    index("customer_support_cases_assigned_idx").on(t.assigned_to_user_id, t.status),
    index("customer_support_cases_status_priority_idx").on(t.status, t.priority),
  ],
);

export const customer_support_messages = mysqlTable(
  "customer_support_messages",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    case_id: varchar("case_id", { length: 255 }).notNull().references(() => customer_support_cases.id, { onDelete: "cascade" }),
    author_user_id: varchar("author_user_id", { length: 255 }).notNull(),
    message: text("message").notNull(),
    is_internal: boolean("is_internal").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("customer_support_messages_case_idx").on(t.case_id, t.created_at)],
);
