import {
  boolean,
  decimal,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { orders } from "@/features/order_management_system/orders/schema";

export const order_assignments = mysqlTable(
  "order_assignments",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    assignment_type: varchar("assignment_type", { length: 32 }).notNull(),
    from_user_id: varchar("from_user_id", { length: 255 }),
    to_user_id: varchar("to_user_id", { length: 255 }).notNull(),
    assigned_by_user_id: varchar("assigned_by_user_id", { length: 255 }).notNull(),
    note: varchar("note", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("order_assignments_order_idx").on(t.order_id, t.created_at),
    index("order_assignments_to_user_idx").on(t.to_user_id, t.assignment_type),
  ],
);

export const order_escalations = mysqlTable(
  "order_escalations",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    escalated_by_user_id: varchar("escalated_by_user_id", { length: 255 }).notNull(),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    reason: varchar("reason", { length: 64 }).notNull(),
    description: text("description"),
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    status: varchar("status", { length: 32 }).notNull().default("open"),
    resolution: text("resolution"),
    resolved_by_user_id: varchar("resolved_by_user_id", { length: 255 }),
    resolved_at: timestamp("resolved_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_escalations_order_idx").on(t.order_id),
    index("order_escalations_status_priority_idx").on(t.status, t.priority),
  ],
);

export const order_holds = mysqlTable(
  "order_holds",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 64 }).notNull(),
    description: text("description"),
    held_by_user_id: varchar("held_by_user_id", { length: 255 }).notNull(),
    released_by_user_id: varchar("released_by_user_id", { length: 255 }),
    released_at: timestamp("released_at", { mode: "string" }),
    released_reason: varchar("released_reason", { length: 512 }),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("order_holds_order_active_idx").on(t.order_id, t.is_active),
    index("order_holds_held_by_idx").on(t.held_by_user_id),
  ],
);

export const order_cancellation_requests = mysqlTable(
  "order_cancellation_requests",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    reason: varchar("reason", { length: 64 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    review_note: varchar("review_note", { length: 512 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    refund_processed: boolean("refund_processed").notNull().default(false),
    refund_amount: decimal("refund_amount", { precision: 12, scale: 2 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_cancellation_requests_order_idx").on(t.order_id),
    index("order_cancellation_requests_status_idx").on(t.status),
  ],
);

export const order_comments = mysqlTable(
  "order_comments",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    author_user_id: varchar("author_user_id", { length: 255 }).notNull(),
    comment_type: varchar("comment_type", { length: 32 }).notNull().default("internal"),
    content: text("content").notNull(),
    is_private: boolean("is_private").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_comments_order_idx").on(t.order_id, t.created_at),
    index("order_comments_author_idx").on(t.author_user_id),
  ],
);
