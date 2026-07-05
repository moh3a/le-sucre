// preorders/schema.ts
import { boolean, float, index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { orders } from "@/features/order_management_system/orders/schema";

export const sku_preorder_settings = mysqlTable("sku_preorder_settings", {
  sku_id: varchar("sku_id", { length: 255 })
    .primaryKey()
    .references(() => product_skus.id, { onDelete: "cascade" }),
  is_preorder_enabled: boolean("is_preorder_enabled").notNull().default(false),
  allow_backorder: boolean("allow_backorder").notNull().default(false), // out-of-stock purchase, uncapped
  max_preorder_qty: int("max_preorder_qty"), // null = unlimited cap for preorder mode
  preorder_sold: int("preorder_sold").notNull().default(0),
  estimated_available_at: timestamp("estimated_available_at", { mode: "string" }),
  deposit_percent: float("deposit_percent", { precision: 5, scale: 2 }).notNull().default(100),
  lead_time_days: int("lead_time_days").notNull().default(14),
  is_active: boolean("is_active").notNull().default(true),
  updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

/** Soft allocation — does NOT reduce on_hand until fulfillment */
export const preorder_allocations = mysqlTable(
  "preorder_allocations",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    warehouse_id: varchar("warehouse_id", { length: 255 }).notNull().default("default"),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    cart_id: varchar("cart_id", { length: 255 }),
    order_item_id: varchar("order_item_id", { length: 255 }),
    quantity: int("quantity").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"), // pending|confirmed|fulfilled|cancelled
    estimated_available_at: timestamp("estimated_available_at", { mode: "string" }),
    fulfilled_at: timestamp("fulfilled_at", { mode: "string" }),
    user_id: varchar("user_id", { length: 255 }),
    contact_name: varchar("contact_name", { length: 255 }),
    contact_email: varchar("contact_email", { length: 255 }),
    contact_phone: varchar("contact_phone", { length: 50 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("preorder_allocations_sku_status_idx").on(t.sku_id, t.status),
    index("preorder_allocations_order_idx").on(t.order_id, t.status),
    index("preorder_allocations_cart_idx").on(t.cart_id),
  ],
);

export const preorder_status_events = mysqlTable(
  "preorder_status_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    allocation_id: varchar("allocation_id", { length: 255 })
      .notNull()
      .references(() => preorder_allocations.id, { onDelete: "cascade" }),
    from_status: varchar("from_status", { length: 32 }),
    to_status: varchar("to_status", { length: 32 }).notNull(),
    note: varchar("note", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("preorder_status_events_alloc_idx").on(t.allocation_id, t.created_at)],
);
