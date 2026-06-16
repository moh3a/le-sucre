import {
  decimal,
  index,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { orders } from "@/features/order_management_system/orders/schema";

export const return_requests = mysqlTable(
  "return_requests",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(), // return | replacement | failed_delivery
    status: varchar("status", { length: 32 }).notNull().default("pending"), // pending | approved | rejected | in_transit | received | completed | cancelled
    reason: text("reason"),
    customer_note: text("customer_note"),
    admin_note: text("admin_note"),
    items: json("items").$type<Array<{ sku_id: string; product_name: string; sku_code: string; quantity: number; unit_price: string; condition?: string }>>().notNull(),
    replacement_order_id: varchar("replacement_order_id", { length: 255 }),
    refund_amount: decimal("refund_amount", { precision: 12, scale: 2 }),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    completed_at: timestamp("completed_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("return_requests_order_idx").on(t.order_id),
    index("return_requests_status_idx").on(t.status, t.created_at),
    index("return_requests_type_idx").on(t.type, t.status),
  ],
);

export type ReturnRequest = typeof return_requests.$inferSelect;
export type NewReturnRequest = typeof return_requests.$inferInsert;
