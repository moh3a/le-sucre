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

/** Raw events (hot ingestion, retention-managed) */
export const analytics_events = mysqlTable(
  "analytics_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    event_type: varchar("event_type", { length: 64 }).notNull(),
    session_key: varchar("session_key", { length: 255 }),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    product_id: varchar("product_id", { length: 255 }),
    sku_id: varchar("sku_id", { length: 255 }),
    category_id: varchar("category_id", { length: 255 }),
    brand_id: varchar("brand_id", { length: 255 }),
    order_id: varchar("order_id", { length: 255 }),
    cart_id: varchar("cart_id", { length: 255 }),
    search_query: varchar("search_query", { length: 512 }),
    campaign_id: varchar("campaign_id", { length: 255 }),
    slot_type: varchar("slot_type", { length: 64 }),
    revenue: decimal("revenue", { precision: 12, scale: 2 }),
    quantity: int("quantity"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    day_key: varchar("day_key", { length: 10 }).notNull(), // YYYY-MM-DD
    occurred_at: timestamp("occurred_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("analytics_events_type_day_idx").on(t.event_type, t.day_key),
    index("analytics_events_product_day_idx").on(t.product_id, t.day_key),
    index("analytics_events_user_day_idx").on(t.user_id, t.day_key),
    index("analytics_events_occurred_idx").on(t.occurred_at),
    index("analytics_events_session_idx").on(t.session_key, t.occurred_at),
  ],
);

/** Daily store-wide KPIs */
export const analytics_daily_metrics = mysqlTable(
  "analytics_daily_metrics",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    orders_count: int("orders_count").notNull().default(0),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    units_sold: int("units_sold").notNull().default(0),
    unique_visitors: int("unique_visitors").notNull().default(0),
    product_views: int("product_views").notNull().default(0),
    add_to_cart: int("add_to_cart").notNull().default(0),
    checkout_started: int("checkout_started").notNull().default(0),
    purchases: int("purchases").notNull().default(0),
    abandoned_carts: int("abandoned_carts").notNull().default(0),
    searches: int("searches").notNull().default(0),
    conversion_rate: decimal("conversion_rate", { precision: 8, scale: 4 }).default("0"),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("analytics_daily_metrics_day_uidx").on(t.day_key)],
);

/** Per-product daily rollups */
export const analytics_product_daily = mysqlTable(
  "analytics_product_daily",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    category_id: varchar("category_id", { length: 255 }),
    brand_id: varchar("brand_id", { length: 255 }),
    views: int("views").notNull().default(0),
    add_to_cart: int("add_to_cart").notNull().default(0),
    purchases: int("purchases").notNull().default(0),
    units_sold: int("units_sold").notNull().default(0),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    clicks: int("clicks").notNull().default(0),
    recommendation_clicks: int("recommendation_clicks").notNull().default(0),
    conversion_rate: decimal("conversion_rate", { precision: 8, scale: 4 }).default("0"),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("analytics_product_daily_uidx").on(t.day_key, t.product_id),
    index("analytics_product_daily_revenue_idx").on(t.day_key, t.revenue),
    index("analytics_product_daily_views_idx").on(t.day_key, t.views),
  ],
);

/** Category / brand performance */
export const analytics_category_daily = mysqlTable(
  "analytics_category_daily",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    category_id: varchar("category_id", { length: 255 }).notNull(),
    views: int("views").notNull().default(0),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    units_sold: int("units_sold").notNull().default(0),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("analytics_category_daily_uidx").on(t.day_key, t.category_id)],
);

export const analytics_brand_daily = mysqlTable(
  "analytics_brand_daily",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    brand_id: varchar("brand_id", { length: 255 }).notNull(),
    views: int("views").notNull().default(0),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    units_sold: int("units_sold").notNull().default(0),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("analytics_brand_daily_uidx").on(t.day_key, t.brand_id)],
);

/** Search analytics */
export const analytics_search_daily = mysqlTable(
  "analytics_search_daily",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    query_normalized: varchar("query_normalized", { length: 255 }).notNull(),
    search_count: int("search_count").notNull().default(0),
    zero_result_count: int("zero_result_count").notNull().default(0),
    click_through_count: int("click_through_count").notNull().default(0),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("analytics_search_daily_uidx").on(t.day_key, t.query_normalized),
    index("analytics_search_daily_count_idx").on(t.day_key, t.search_count),
  ],
);

/** Funnel steps per day */
export const analytics_funnel_daily = mysqlTable(
  "analytics_funnel_daily",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    step: varchar("step", { length: 32 }).notNull(),
    // view | add_to_cart | checkout | purchase
    sessions: int("sessions").notNull().default(0),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("analytics_funnel_daily_uidx").on(t.day_key, t.step)],
);

/** Customer cohort / retention */
export const analytics_customer_cohorts = mysqlTable(
  "analytics_customer_cohorts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    cohort_month: varchar("cohort_month", { length: 7 }).notNull(), // YYYY-MM
    period_offset: int("period_offset").notNull().default(0),
    customers_count: int("customers_count").notNull().default(0),
    repeat_purchase_rate: decimal("repeat_purchase_rate", { precision: 8, scale: 4 }).default("0"),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("analytics_customer_cohorts_uidx").on(t.cohort_month, t.period_offset)],
);

/** Aggregation jobs */
export const analytics_jobs = mysqlTable(
  "analytics_jobs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    job_type: varchar("job_type", { length: 64 }).notNull(),
    // rollup_daily | rebuild_product | rebuild_cohorts | purge_raw
    payload: json("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    run_after: timestamp("run_after", { mode: "string" }).defaultNow().notNull(),
    attempts: int("attempts").notNull().default(0),
    last_error: varchar("last_error", { length: 1000 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("analytics_jobs_status_run_idx").on(t.status, t.run_after)],
);
