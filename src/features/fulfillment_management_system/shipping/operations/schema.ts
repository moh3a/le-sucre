import { index, int, json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { orders } from "@/features/order_management_system/orders/schema";

export const delivery_attempts = mysqlTable(
  "delivery_attempts",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    shipment_id: varchar("shipment_id", { length: 255 }).notNull(),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    attempt_number: int("attempt_number").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    description: varchar("description", { length: 512 }),
    delivery_person_id: varchar("delivery_person_id", { length: 255 }),
    attempted_at: timestamp("attempted_at", { mode: "string" }).notNull(),
    next_attempt_at: timestamp("next_attempt_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("delivery_attempts_shipment_idx").on(t.shipment_id, t.attempt_number),
    index("delivery_attempts_order_idx").on(t.order_id),
  ],
);
