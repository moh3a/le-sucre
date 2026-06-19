import {
  index,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { orders } from "@/features/order_management_system/orders/schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

export const warranty_requests = mysqlTable(
  "warranty_requests",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    order_item_id: varchar("order_item_id", { length: 255 }),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    issue_type: varchar("issue_type", { length: 64 }).notNull(),
    description: text("description").notNull(),
    technician_user_id: varchar("technician_user_id", { length: 255 }),
    technician_notes: text("technician_notes"),
    resolution_type: varchar("resolution_type", { length: 32 }),
    resolution_notes: text("resolution_notes"),
    resolution_date: timestamp("resolution_date", { mode: "string" }),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    completed_at: timestamp("completed_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("warranty_requests_order_idx").on(t.order_id),
    index("warranty_requests_user_idx").on(t.user_id),
    index("warranty_requests_technician_idx").on(t.technician_user_id),
    index("warranty_requests_status_idx").on(t.status),
  ],
);
