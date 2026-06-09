import {
  decimal,
  index,
  int,
  json,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { orders } from "@/features/order_management_system/orders/schema";

export const invoices = mysqlTable(
  "invoices",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    invoice_number: varchar("invoice_number", { length: 64 }).notNull(),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 32 }).notNull().default("unpaid"), // unpaid | paid | void | refunded | partially_refunded
    type: varchar("type", { length: 32 }).notNull().default("order_invoice"), // order_invoice | refund_invoice | credit_note
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),

    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
    discount_total: decimal("discount_total", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    tax_total: decimal("tax_total", { precision: 12, scale: 2 }).notNull().default("0.00"),
    shipping_total: decimal("shipping_total", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    grand_total: decimal("grand_total", { precision: 12, scale: 2 }).notNull().default("0.00"),

    billing_address: json("billing_address").$type<Record<string, unknown>>().notNull(),
    shipping_address: json("shipping_address").$type<Record<string, unknown>>().notNull(),

    vat_number: varchar("vat_number", { length: 64 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),

    due_at: timestamp("due_at", { mode: "string" }),
    paid_at: timestamp("paid_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("invoices_invoice_number_uidx").on(t.invoice_number),
    index("invoices_order_idx").on(t.order_id),
    index("invoices_user_idx").on(t.user_id),
    index("invoices_status_idx").on(t.status),
    index("invoices_type_idx").on(t.type),
    index("invoices_created_idx").on(t.created_at),
  ],
);

export const invoice_items = mysqlTable(
  "invoice_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    invoice_id: varchar("invoice_id", { length: 255 })
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    sku_code: varchar("sku_code", { length: 128 }).notNull(),
    product_name: varchar("product_name", { length: 255 }).notNull(),
    quantity: int("quantity").notNull(),
    unit_price: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    tax_rate: decimal("tax_rate", { precision: 4, scale: 2 }).notNull().default("0.19"), // default 19%
    tax_amount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
    line_total: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("invoice_items_invoice_idx").on(t.invoice_id),
    index("invoice_items_sku_idx").on(t.sku_id),
  ],
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  order: one(orders, { fields: [invoices.order_id], references: [orders.id] }),
  user: one(users, { fields: [invoices.user_id], references: [users.id] }),
  items: many(invoice_items),
}));

export const invoiceItemsRelations = relations(invoice_items, ({ one }) => ({
  invoice: one(invoices, { fields: [invoice_items.invoice_id], references: [invoices.id] }),
}));
