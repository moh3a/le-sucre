import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { carts } from "../schema";

export const customer_addresses = mysqlTable(
  "customer_addresses",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 64 }).default("home"),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    line1: varchar("line1", { length: 255 }).notNull(),
    line2: varchar("line2", { length: 255 }),
    city: varchar("city", { length: 128 }).notNull(),
    state: varchar("state", { length: 128 }),
    postal_code: varchar("postal_code", { length: 32 }),
    country_code: varchar("country_code", { length: 2 }).notNull().default("DZ"),
    is_default_shipping: boolean("is_default_shipping").notNull().default(false),
    is_default_billing: boolean("is_default_billing").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [index("customer_addresses_user_idx").on(t.user_id)],
);

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_number: varchar("order_number", { length: 32 }).notNull(),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    guest_email: varchar("guest_email", { length: 255 }),
    cart_id: varchar("cart_id", { length: 24 }).references(() => carts.id, {
      onDelete: "set null",
    }),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    channel: varchar("channel", { length: 32 }).notNull().default("retail"),

    status: varchar("status", { length: 32 }).notNull().default("pending_payment"),
    payment_status: varchar("payment_status", { length: 32 }).notNull().default("pending"),
    fulfillment_status: varchar("fulfillment_status", { length: 32 })
      .notNull()
      .default("unfulfilled"),

    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    discount_total: decimal("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
    tax_total: decimal("tax_total", { precision: 12, scale: 2 }).notNull().default("0"),
    shipping_total: decimal("shipping_total", { precision: 12, scale: 2 }).notNull().default("0"),
    grand_total: decimal("grand_total", { precision: 12, scale: 2 }).notNull(),

    shipping_address: json("shipping_address").$type<Record<string, unknown>>().notNull(),
    billing_address: json("billing_address").$type<Record<string, unknown>>(),

    idempotency_key: varchar("idempotency_key", { length: 64 }),
    payment_provider: varchar("payment_provider", { length: 32 }),
    payment_reference: varchar("payment_reference", { length: 128 }),
    shipment_provider: varchar("shipment_provider", { length: 32 }),
    shipment_reference: varchar("shipment_reference", { length: 128 }),

    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    placed_at: timestamp("placed_at", { mode: "string" }),
    cancelled_at: timestamp("cancelled_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("orders_order_number_uidx").on(t.order_number),
    uniqueIndex("orders_idempotency_uidx").on(t.idempotency_key),
    index("orders_user_created_idx").on(t.user_id, t.created_at),
    index("orders_status_idx").on(t.status, t.created_at),
  ],
);

export const order_items = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 24 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sku_id: varchar("sku_id", { length: 24 }).notNull(),
    product_id: varchar("product_id", { length: 24 }).notNull(),
    sku_code: varchar("sku_code", { length: 128 }).notNull(),
    product_name: varchar("product_name", { length: 255 }).notNull(),
    quantity: int("quantity").notNull(),
    unit_price: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    line_total: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    reservation_id: varchar("reservation_id", { length: 24 }),
    fulfillment_type: varchar("fulfillment_type", { length: 32 }).notNull().default("standard"),
    preorder_status: varchar("preorder_status", { length: 32 }),
    estimated_available_at: timestamp("estimated_available_at", { mode: "string" }),
    preorder_allocation_id: varchar("preorder_allocation_id", { length: 24 }),
    payment_capture_mode: varchar("payment_capture_mode", { length: 16 }).notNull().default("full"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  },
  (t) => [
    index("order_items_order_idx").on(t.order_id),
    index("order_items_preorder_status_idx").on(t.preorder_status),
    index("order_items_preorder_alloc_idx").on(t.preorder_allocation_id),
  ],
);

export const order_adjustments = mysqlTable(
  "order_adjustments",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 24 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(), // tax | discount | shipping
    label: varchar("label", { length: 128 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  },
  (t) => [index("order_adjustments_order_idx").on(t.order_id)],
);

export const order_status_events = mysqlTable(
  "order_status_events",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 24 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    from_status: varchar("from_status", { length: 32 }),
    to_status: varchar("to_status", { length: 32 }).notNull(),
    actor_user_id: varchar("actor_user_id", { length: 255 }),
    note: varchar("note", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("order_status_events_order_idx").on(t.order_id, t.created_at)],
);

export const discount_codes = mysqlTable(
  "discount_codes",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    code: varchar("code", { length: 64 }).notNull(),
    type: varchar("type", { length: 16 }).notNull(), // percent | fixed
    value: decimal("value", { precision: 12, scale: 2 }).notNull(),
    min_subtotal: decimal("min_subtotal", { precision: 12, scale: 2 }),
    is_active: boolean("is_active").notNull().default(true),
    expires_at: timestamp("expires_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("discount_codes_code_uidx").on(t.code)],
);
