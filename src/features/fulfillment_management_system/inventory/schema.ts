export * from "./operations/schema";

import { generate_id } from "@/lib/utils";
import { index, int, mysqlTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { product_skus } from "../../product_information_management/schema";

export const inventory_levels = mysqlTable(
  "inventory_levels",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    warehouse_id: varchar("warehouse_id", { length: 255 }).notNull().default("default"),
    quantity_on_hand: int("quantity_on_hand").notNull().default(0),
    quantity_reserved: int("quantity_reserved").notNull().default(0),
    version: int("version").notNull().default(0), // optimistic locking
  },
  (t) => [uniqueIndex("inventory_levels_sku_wh_uidx").on(t.sku_id, t.warehouse_id)],
);

export const inventory_movements = mysqlTable(
  "inventory_movements",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    warehouse_id: varchar("warehouse_id", { length: 255 }).notNull().default("default"),
    movement_type: varchar("movement_type", { length: 32 }).notNull(), // adjust | reserve | release | sale | receive
    quantity_delta: int("quantity_delta").notNull(),
    reference_type: varchar("reference_type", { length: 64 }),
    reference_id: varchar("reference_id", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("inventory_movements_sku_idx").on(t.sku_id, t.created_at)],
);

export const inventory_reservations = mysqlTable(
  "inventory_reservations",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    warehouse_id: varchar("warehouse_id", { length: 255 }).notNull().default("default"),
    quantity: int("quantity").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"), // active | committed | released | expired
    cart_id: varchar("cart_id", { length: 255 }),
    order_id: varchar("order_id", { length: 255 }),
    expires_at: timestamp("expires_at", { mode: "string" }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("inventory_reservations_sku_status_idx").on(t.sku_id, t.status),
    index("inventory_reservations_expires_idx").on(t.expires_at),
  ],
);
