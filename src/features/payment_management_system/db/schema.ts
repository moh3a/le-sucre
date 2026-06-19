import {
  decimal,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { orders } from "@/features/order_management_system/orders/schema";

export const payment_transactions = mysqlTable(
  "payment_transactions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    invoice_id: varchar("invoice_id", { length: 255 }),

    provider: varchar("provider", { length: 64 }).notNull(),
    provider_transaction_id: varchar("provider_transaction_id", { length: 255 }),
    provider_payment_method: varchar("provider_payment_method", { length: 64 }),
    provider_response: json("provider_response").$type<Record<string, unknown>>().default({}),

    type: varchar("type", { length: 32 }).notNull().default("full"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),

    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    fee: decimal("fee", { precision: 12, scale: 2 }).notNull().default("0.00"),
    net_amount: decimal("net_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
    refunded_amount: decimal("refunded_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),

    failure_reason: text("failure_reason"),
    failure_code: varchar("failure_code", { length: 64 }),
    retry_count: int("retry_count").notNull().default(0),
    max_retries: int("max_retries").notNull().default(3),

    idempotency_key: varchar("idempotency_key", { length: 128 }),
    description: text("description"),

    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    captured_at: timestamp("captured_at", { mode: "string" }),
    failed_at: timestamp("failed_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("payment_tx_idempotency_uidx").on(t.idempotency_key),
    uniqueIndex("payment_tx_provider_ref_uidx").on(t.provider, t.provider_transaction_id),
    index("payment_tx_order_idx").on(t.order_id),
    index("payment_tx_user_idx").on(t.user_id),
    index("payment_tx_status_idx").on(t.status),
    index("payment_tx_type_idx").on(t.type),
    index("payment_tx_provider_idx").on(t.provider),
    index("payment_tx_created_idx").on(t.created_at),
  ],
);

export const payment_partials = mysqlTable(
  "payment_partials",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    transaction_id: varchar("transaction_id", { length: 255 })
      .notNull()
      .references(() => payment_transactions.id, { onDelete: "cascade" }),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 32 }).notNull(), // deposit | installment
    status: varchar("status", { length: 32 }).notNull().default("pending"),

    installment_number: int("installment_number"),
    total_installments: int("total_installments"),

    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    paid_amount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
    remaining_amount: decimal("remaining_amount", { precision: 12, scale: 2 }).notNull(),

    due_at: timestamp("due_at", { mode: "string" }).notNull(),
    paid_at: timestamp("paid_at", { mode: "string" }),

    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("payment_partials_tx_idx").on(t.transaction_id),
    index("payment_partials_order_idx").on(t.order_id),
    index("payment_partials_status_idx").on(t.status),
    index("payment_partials_due_idx").on(t.due_at),
  ],
);

export const payment_refunds = mysqlTable(
  "payment_refunds",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    transaction_id: varchar("transaction_id", { length: 255 })
      .notNull()
      .references(() => payment_transactions.id, { onDelete: "cascade" }),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    invoice_id: varchar("invoice_id", { length: 255 }),

    provider_refund_id: varchar("provider_refund_id", { length: 255 }),
    provider_response: json("provider_response").$type<Record<string, unknown>>().default({}),

    type: varchar("type", { length: 32 }).notNull().default("full"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    reason: text("reason"),
    approved_by: varchar("approved_by", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    approved_at: timestamp("approved_at", { mode: "string" }),

    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    fee_refunded: decimal("fee_refunded", { precision: 12, scale: 2 }).notNull().default("0.00"),
    net_refunded: decimal("net_refunded", { precision: 12, scale: 2 }).notNull().default("0.00"),

    sku_refunds: json("sku_refunds").$type<Array<{ sku_id: string; quantity: number; amount: string }>>().default([]),

    failure_reason: text("failure_reason"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    processed_at: timestamp("processed_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("payment_refunds_tx_idx").on(t.transaction_id),
    index("payment_refunds_order_idx").on(t.order_id),
    index("payment_refunds_user_idx").on(t.user_id),
    index("payment_refunds_status_idx").on(t.status),
    index("payment_refunds_type_idx").on(t.type),
    index("payment_refunds_created_idx").on(t.created_at),
  ],
);

export const payment_payouts = mysqlTable(
  "payment_payouts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    vendor_id: varchar("vendor_id", { length: 255 }),
    transaction_id: varchar("transaction_id", { length: 255 }).references(
      () => payment_transactions.id,
      { onDelete: "set null" },
    ),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, {
      onDelete: "set null",
    }),

    type: varchar("type", { length: 32 }).notNull().default("vendor_payout"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),

    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    gross_amount: decimal("gross_amount", { precision: 12, scale: 2 }).notNull(),
    commission_amount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
    commission_rate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
    net_amount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
    fee: decimal("fee", { precision: 12, scale: 2 }).notNull().default("0.00"),

    payout_method: varchar("payout_method", { length: 64 }),
    payout_reference: varchar("payout_reference", { length: 255 }),
    provider_response: json("provider_response").$type<Record<string, unknown>>().default({}),

    description: text("description"),
    failure_reason: text("failure_reason"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),

    processed_at: timestamp("processed_at", { mode: "string" }),
    paid_at: timestamp("paid_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("payment_payouts_vendor_idx").on(t.vendor_id),
    index("payment_payouts_tx_idx").on(t.transaction_id),
    index("payment_payouts_order_idx").on(t.order_id),
    index("payment_payouts_status_idx").on(t.status),
    index("payment_payouts_type_idx").on(t.type),
    index("payment_payouts_created_idx").on(t.created_at),
  ],
);

export const payment_payout_items = mysqlTable(
  "payment_payout_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    payout_id: varchar("payout_id", { length: 255 })
      .notNull()
      .references(() => payment_payouts.id, { onDelete: "cascade" }),
    order_item_id: varchar("order_item_id", { length: 255 }).notNull(),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    product_name: varchar("product_name", { length: 255 }).notNull(),
    quantity: int("quantity").notNull(),
    unit_price: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    commission_amount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
    net_amount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("payout_items_payout_idx").on(t.payout_id),
    index("payout_items_sku_idx").on(t.sku_id),
  ],
);

export const payment_audit_logs = mysqlTable(
  "payment_audit_logs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    transaction_id: varchar("transaction_id", { length: 255 }).references(
      () => payment_transactions.id,
      { onDelete: "set null" },
    ),
    refund_id: varchar("refund_id", { length: 255 }).references(() => payment_refunds.id, {
      onDelete: "set null",
    }),
    payout_id: varchar("payout_id", { length: 255 }).references(() => payment_payouts.id, {
      onDelete: "set null",
    }),
    order_id: varchar("order_id", { length: 255 }),
    actor_user_id: varchar("actor_user_id", { length: 255 }),

    action: varchar("action", { length: 64 }).notNull(),
    resource_type: varchar("resource_type", { length: 64 }).notNull(),
    resource_id: varchar("resource_id", { length: 255 }),

    from_status: varchar("from_status", { length: 32 }),
    to_status: varchar("to_status", { length: 32 }),

    changes: json("changes").$type<Record<string, unknown>>().default({}),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),

    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: text("user_agent"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("payment_audit_tx_idx").on(t.transaction_id),
    index("payment_audit_refund_idx").on(t.refund_id),
    index("payment_audit_payout_idx").on(t.payout_id),
    index("payment_audit_order_idx").on(t.order_id),
    index("payment_audit_action_idx").on(t.action),
    index("payment_audit_resource_idx").on(t.resource_type, t.resource_id),
    index("payment_audit_created_idx").on(t.created_at),
    index("payment_audit_actor_idx").on(t.actor_user_id),
  ],
);

export const payment_transactionsRelations = relations(payment_transactions, ({ one, many }) => ({
  order: one(orders, { fields: [payment_transactions.order_id], references: [orders.id] }),
  user: one(users, { fields: [payment_transactions.user_id], references: [users.id] }),
  partials: many(payment_partials),
  refunds: many(payment_refunds),
  audit_logs: many(payment_audit_logs),
  payouts: many(payment_payouts),
}));

export const payment_partialsRelations = relations(payment_partials, ({ one }) => ({
  transaction: one(payment_transactions, {
    fields: [payment_partials.transaction_id],
    references: [payment_transactions.id],
  }),
  order: one(orders, { fields: [payment_partials.order_id], references: [orders.id] }),
}));

export const payment_refundsRelations = relations(payment_refunds, ({ one }) => ({
  transaction: one(payment_transactions, {
    fields: [payment_refunds.transaction_id],
    references: [payment_transactions.id],
  }),
  order: one(orders, { fields: [payment_refunds.order_id], references: [orders.id] }),
  user: one(users, { fields: [payment_refunds.user_id], references: [users.id] }),
  approver: one(users, { fields: [payment_refunds.approved_by], references: [users.id] }),
}));

export const payment_payoutsRelations = relations(payment_payouts, ({ one, many }) => ({
  transaction: one(payment_transactions, {
    fields: [payment_payouts.transaction_id],
    references: [payment_transactions.id],
  }),
  order: one(orders, { fields: [payment_payouts.order_id], references: [orders.id] }),
  items: many(payment_payout_items),
}));

export const payment_payout_itemsRelations = relations(payment_payout_items, ({ one }) => ({
  payout: one(payment_payouts, {
    fields: [payment_payout_items.payout_id],
    references: [payment_payouts.id],
  }),
}));

export const payment_audit_logsRelations = relations(payment_audit_logs, ({ one }) => ({
  transaction: one(payment_transactions, {
    fields: [payment_audit_logs.transaction_id],
    references: [payment_transactions.id],
  }),
  refund: one(payment_refunds, {
    fields: [payment_audit_logs.refund_id],
    references: [payment_refunds.id],
  }),
  payout: one(payment_payouts, {
    fields: [payment_audit_logs.payout_id],
    references: [payment_payouts.id],
  }),
}));
