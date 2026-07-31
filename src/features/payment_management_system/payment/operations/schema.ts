import { decimal, index, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { orders } from "@/features/order_management_system/orders/schema";
import { return_requests } from "@/features/order_management_system/return_replacement/schema";

export const payment_verifications = mysqlTable(
  "payment_verifications",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    verification_type: varchar("verification_type", { length: 32 }).notNull().default("manual"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    reference_number: varchar("reference_number", { length: 128 }),
    proof_url: varchar("proof_url", { length: 2048 }),
    notes: text("notes"),
    verified_by_user_id: varchar("verified_by_user_id", { length: 255 }),
    verified_at: timestamp("verified_at", { mode: "string" }),
    rejection_reason: varchar("rejection_reason", { length: 512 }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("payment_verifications_order_idx").on(t.order_id),
    index("payment_verifications_status_idx").on(t.status),
  ],
);

export const refund_requests = mysqlTable(
  "refund_requests",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    return_request_id: varchar("return_request_id", { length: 255 }).references(() => return_requests.id, { onDelete: "set null" }),
    cancellation_request_id: varchar("cancellation_request_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    refund_method: varchar("refund_method", { length: 32 }),
    reason: text("reason").notNull(),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    approved_by_user_id: varchar("approved_by_user_id", { length: 255 }),
    approved_at: timestamp("approved_at", { mode: "string" }),
    processed_by_user_id: varchar("processed_by_user_id", { length: 255 }),
    processed_at: timestamp("processed_at", { mode: "string" }),
    provider_reference: varchar("provider_reference", { length: 128 }),
    rejection_reason: varchar("rejection_reason", { length: 512 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("refund_requests_order_idx").on(t.order_id),
    index("refund_requests_status_idx").on(t.status),
  ],
);

export const partial_payments = mysqlTable(
  "partial_payments",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    payment_number: int("payment_number").notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    paid_at: timestamp("paid_at", { mode: "string" }),
    payment_method: varchar("payment_method", { length: 32 }),
    payment_reference: varchar("payment_reference", { length: 128 }),
    notes: varchar("notes", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("partial_payments_order_idx").on(t.order_id, t.payment_number),
    index("partial_payments_status_idx").on(t.status),
  ],
);
