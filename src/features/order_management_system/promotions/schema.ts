import {
  boolean,
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
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { products } from "@/features/product_information_management/products/schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { orders } from "@/features/order_management_system/orders/schema";

/** Master promotion campaign */
export const promotions = mysqlTable(
  "promotions",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    promotion_type: varchar("promotion_type", { length: 32 }).notNull(),
    // promo_code | automatic | flash_sale | bundle | customer
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    // draft | scheduled | active | paused | expired
    priority: int("priority").notNull().default(100),
    is_stackable: boolean("is_stackable").notNull().default(false),
    starts_at: timestamp("starts_at", { mode: "string" }),
    ends_at: timestamp("ends_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("promotions_slug_uidx").on(t.slug),
    index("promotions_status_schedule_idx").on(t.status, t.starts_at, t.ends_at),
    index("promotions_type_idx").on(t.promotion_type, t.status),
  ],
);

/** Scoped discount rules */
export const promotion_rules = mysqlTable(
  "promotion_rules",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 24 })
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    scope_type: varchar("scope_type", { length: 32 }).notNull(),
    // cart | category | product | sku | customer | shipping
    scope_id: varchar("scope_id", { length: 255 }),
    discount_type: varchar("discount_type", { length: 32 }).notNull(),
    // percent | fixed | free_shipping | buy_x_get_y | bundle_price
    discount_value: decimal("discount_value", { precision: 12, scale: 2 }).notNull().default("0"),
    min_subtotal: decimal("min_subtotal", { precision: 12, scale: 2 }),
    min_quantity: int("min_quantity"),
    max_discount_amount: decimal("max_discount_amount", { precision: 12, scale: 2 }),
    buy_quantity: int("buy_quantity"),
    get_quantity: int("get_quantity"),
    config: json("config").$type<Record<string, unknown>>().default({}),
    sort_order: int("sort_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("promotion_rules_promotion_idx").on(t.promotion_id, t.is_active),
    index("promotion_rules_scope_idx").on(t.scope_type, t.scope_id),
  ],
);

/** Promo codes linked to promotions */
export const promo_codes = mysqlTable(
  "promo_codes",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 24 })
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 64 }).notNull(),
    usage_limit: int("usage_limit"),
    usage_count: int("usage_count").notNull().default(0),
    per_customer_limit: int("per_customer_limit").default(1),
    is_active: boolean("is_active").notNull().default(true),
    starts_at: timestamp("starts_at", { mode: "string" }),
    ends_at: timestamp("ends_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("promo_codes_code_uidx").on(t.code),
    index("promo_codes_promotion_idx").on(t.promotion_id),
  ],
);

/** Flash sales */
export const flash_sales = mysqlTable(
  "flash_sales",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 24 })
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    starts_at: timestamp("starts_at", { mode: "string" }).notNull(),
    ends_at: timestamp("ends_at", { mode: "string" }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("scheduled"),
    // scheduled | active | ended | cancelled
    max_total_units: int("max_total_units"),
    sold_total_units: int("sold_total_units").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("flash_sales_status_schedule_idx").on(t.status, t.starts_at),
    index("flash_sales_promotion_idx").on(t.promotion_id),
  ],
);

export const flash_sale_items = mysqlTable(
  "flash_sale_items",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    flash_sale_id: varchar("flash_sale_id", { length: 24 })
      .notNull()
      .references(() => flash_sales.id, { onDelete: "cascade" }),
    sku_id: varchar("sku_id", { length: 24 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    flash_price: decimal("flash_price", { precision: 12, scale: 2 }).notNull(),
    max_quantity: int("max_quantity").notNull(),
    sold_quantity: int("sold_quantity").notNull().default(0),
    version: int("version").notNull().default(0),
  },
  (t) => [
    uniqueIndex("flash_sale_items_sale_sku_uidx").on(t.flash_sale_id, t.sku_id),
    index("flash_sale_items_sku_idx").on(t.sku_id),
  ],
);

/** Bundle offers */
export const promotion_bundles = mysqlTable(
  "promotion_bundles",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 24 })
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    bundle_type: varchar("bundle_type", { length: 32 }).notNull(),
    // fixed_price | percent_off | buy_x_get_y | cross_sell
    bundle_price: decimal("bundle_price", { precision: 12, scale: 2 }),
    discount_percent: decimal("discount_percent", { precision: 5, scale: 2 }),
    buy_quantity: int("buy_quantity"),
    get_quantity: int("get_quantity"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("promotion_bundles_promotion_idx").on(t.promotion_id, t.is_active)],
);

export const promotion_bundle_items = mysqlTable(
  "promotion_bundle_items",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    bundle_id: varchar("bundle_id", { length: 24 })
      .notNull()
      .references(() => promotion_bundles.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 24 }).references(() => products.id, {
      onDelete: "cascade",
    }),
    sku_id: varchar("sku_id", { length: 24 }).references(() => product_skus.id, {
      onDelete: "cascade",
    }),
    quantity: int("quantity").notNull().default(1),
    is_required: boolean("is_required").notNull().default(true),
  },
  (t) => [index("promotion_bundle_items_bundle_idx").on(t.bundle_id)],
);

/** Redemption audit */
export const promotion_redemptions = mysqlTable(
  "promotion_redemptions",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 24 }).notNull(),
    promo_code_id: varchar("promo_code_id", { length: 24 }),
    order_id: varchar("order_id", { length: 24 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    discount_amount: decimal("discount_amount", { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("promotion_redemptions_promotion_idx").on(t.promotion_id, t.created_at),
    index("promotion_redemptions_user_code_idx").on(t.user_id, t.promo_code_id),
  ],
);

export const promotion_jobs = mysqlTable(
  "promotion_jobs",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    job_type: varchar("job_type", { length: 64 }).notNull(),
    // activate_flash | deactivate_flash | expire_promotions
    payload: json("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    run_after: timestamp("run_after", { mode: "string" }).defaultNow().notNull(),
    attempts: int("attempts").notNull().default(0),
    last_error: varchar("last_error", { length: 1000 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("promotion_jobs_status_run_idx").on(t.status, t.run_after)],
);
