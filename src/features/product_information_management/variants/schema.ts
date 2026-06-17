import { generate_id } from "@/lib/utils";
import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { products } from "../schema";

// product_properties — axes per product
export const product_properties = mysqlTable(
  "product_properties",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 64 }).notNull(), // "color"
    name: varchar("name", { length: 255 }).notNull(), // "Couleur"
    sort_order: int("sort_order").notNull().default(0),
    is_required: boolean("is_required").notNull().default(true),
  },
  (t) => [uniqueIndex("product_properties_product_code_uidx").on(t.product_id, t.code)],
);

// property_values — options
export const property_values = mysqlTable(
  "property_values",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    property_id: varchar("property_id", { length: 255 })
      .notNull()
      .references(() => product_properties.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 64 }).notNull(), // "red"
    label: varchar("label", { length: 255 }).notNull(),
    sort_order: int("sort_order").notNull().default(0),
    thumbnail_image: varchar("thumbnail_image", { length: 1024 }),
    color_hex: varchar("color_hex", { length: 7 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  },
  (t) => [uniqueIndex("property_values_property_code_uidx").on(t.property_id, t.code)],
);

// product_skus — sellable units (millions of rows: index-heavy, narrow row)
export const product_skus = mysqlTable(
  "product_skus",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku_code: varchar("sku_code", { length: 128 }).notNull(),
    option_signature: varchar("option_signature", { length: 512 }).notNull(), // canonical key
    barcode: varchar("barcode", { length: 64 }),
    base_price: decimal("base_price", { precision: 12, scale: 2 }),
    offer_price: decimal("offer_price", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    is_active: boolean("is_active").notNull().default(true),
    // denormalized for listing (updated by inventory sync)
    stock_available: int("stock_available").notNull().default(0),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_skus_sku_code_uidx").on(t.sku_code),
    uniqueIndex("product_skus_product_signature_uidx").on(t.product_id, t.option_signature),
    index("product_skus_product_active_idx").on(t.product_id, t.is_active),
    index("product_skus_stock_idx").on(t.product_id, t.stock_available),
  ],
);

// sku_option_values — junction (2–6 rows per SKU typically)
export const sku_option_values = mysqlTable(
  "sku_option_values",
  {
    sku_id: varchar("sku_id", { length: 255 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    property_value_id: varchar("property_value_id", { length: 255 })
      .notNull()
      .references(() => property_values.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.sku_id, t.property_value_id] }),
    index("sku_option_values_value_idx").on(t.property_value_id),
  ],
);

// sku_prices — channel / quantity breaks at SKU level
export const sku_prices = mysqlTable(
  "sku_prices",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 32 }).notNull().default("retail"), // retail | wholesale
    min_quantity: int("min_quantity").notNull().default(1),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    valid_from: timestamp("valid_from", { mode: "string" }),
    valid_to: timestamp("valid_to", { mode: "string" }),
  },
  (t) => [index("sku_prices_lookup_idx").on(t.sku_id, t.channel, t.min_quantity)],
);

// wholesale_rules — product-wide or SKU-specific bulk tiers
export const wholesale_rules = mysqlTable(
  "wholesale_rules",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 }).references(() => products.id, {
      onDelete: "cascade",
    }),
    sku_id: varchar("sku_id", { length: 255 }).references(() => product_skus.id, {
      onDelete: "cascade",
    }),
    min_quantity: int("min_quantity").notNull(),
    price: decimal("price", { precision: 12, scale: 2 }),
    discount_percent: decimal("discount_percent", { precision: 5, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    is_active: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("wholesale_rules_product_idx").on(t.product_id, t.min_quantity),
    index("wholesale_rules_sku_idx").on(t.sku_id, t.min_quantity),
  ],
);
