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
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { products } from "@/features/product_information_management/products/schema";

export const carts = mysqlTable(
  "carts",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    guest_token: varchar("guest_token", { length: 64 }),
    status: varchar("status", { length: 32 }).notNull().default("active"), // active | merged | converted
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    channel: varchar("channel", { length: 32 }).notNull().default("retail"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    expires_at: timestamp("expires_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("carts_user_status_idx").on(t.user_id, t.status),
    uniqueIndex("carts_guest_token_uidx").on(t.guest_token),
  ],
);

export const cart_items = mysqlTable(
  "cart_items",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    cart_id: varchar("cart_id", { length: 24 })
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    sku_id: varchar("sku_id", { length: 24 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "restrict" }),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: int("quantity").notNull().default(1),
    unit_price: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    reservation_id: varchar("reservation_id", { length: 24 }),
    fulfillment_type: varchar("fulfillment_type", { length: 32 }).notNull().default("standard"),
    preorder_allocation_id: varchar("preorder_allocation_id", { length: 24 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("cart_items_cart_sku_uidx").on(t.cart_id, t.sku_id),
    index("cart_items_cart_idx").on(t.cart_id),
    index("cart_items_preorder_alloc_idx").on(t.preorder_allocation_id),
  ],
);
