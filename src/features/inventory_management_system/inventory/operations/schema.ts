import { index, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export const inventory_adjustment_requests = mysqlTable(
  "inventory_adjustment_requests",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    warehouse_id: varchar("warehouse_id", { length: 255 }).notNull().default("default"),
    adjustment_type: varchar("adjustment_type", { length: 32 }).notNull(),
    quantity_delta: int("quantity_delta").notNull(),
    current_on_hand: int("current_on_hand").notNull(),
    expected_on_hand: int("expected_on_hand").notNull(),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    review_note: varchar("review_note", { length: 512 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("inventory_adjustment_requests_sku_idx").on(t.sku_id),
    index("inventory_adjustment_requests_status_idx").on(t.status),
    index("inventory_adjustment_requests_requested_by_idx").on(t.requested_by_user_id),
  ],
);
