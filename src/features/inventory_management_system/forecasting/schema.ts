// forecasting/schema.ts
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
import { product_skus } from "@/features/product_information_management/variants/schema";

/** Daily sales velocity (aggregated from paid orders) */
export const inventory_sales_velocity_daily = mysqlTable(
  "inventory_sales_velocity_daily",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 24 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    warehouse_id: varchar("warehouse_id", { length: 24 }).notNull().default("default"),
    day_key: varchar("day_key", { length: 10 }).notNull(), // YYYY-MM-DD
    units_sold: int("units_sold").notNull().default(0),
    units_returned: int("units_returned").notNull().default(0),
    revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull().default("0"),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("inventory_velocity_day_uidx").on(t.sku_id, t.warehouse_id, t.day_key),
    index("inventory_velocity_sku_day_idx").on(t.sku_id, t.day_key),
  ],
);

/** Precomputed forecast snapshot per SKU */
export const inventory_forecast_snapshots = mysqlTable(
  "inventory_forecast_snapshots",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 24 })
      .notNull()
      .references(() => product_skus.id, { onDelete: "cascade" }),
    warehouse_id: varchar("warehouse_id", { length: 24 }).notNull().default("default"),
    avg_daily_sales: decimal("avg_daily_sales", { precision: 10, scale: 4 }).notNull().default("0"),
    trend_slope: decimal("trend_slope", { precision: 10, scale: 6 }).notNull().default("0"), // units/day change
    days_until_stockout: decimal("days_until_stockout", { precision: 10, scale: 2 }),
    predicted_demand_30d: int("predicted_demand_30d").notNull().default(0),
    recommended_reorder_qty: int("recommended_reorder_qty").notNull().default(0),
    safety_stock: int("safety_stock").notNull().default(0),
    lead_time_days: int("lead_time_days").notNull().default(7),
    confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull().default("0.5"),
    risk_level: varchar("risk_level", { length: 16 }).notNull().default("normal"), // low|normal|high|critical
    signals: json("signals").$type<Record<string, number>>().default({}),
    computed_at: timestamp("computed_at", { mode: "string" }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("inventory_forecast_snapshot_uidx").on(t.sku_id, t.warehouse_id),
    index("inventory_forecast_risk_idx").on(t.risk_level, t.computed_at),
    index("inventory_forecast_stockout_idx").on(t.days_until_stockout),
  ],
);

/** Configurable thresholds (global / category / sku) */
export const inventory_alert_rules = mysqlTable(
  "inventory_alert_rules",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    scope_type: varchar("scope_type", { length: 16 }).notNull(), // global|category|sku
    scope_id: varchar("scope_id", { length: 255 }),
    low_stock_threshold: int("low_stock_threshold").notNull().default(5),
    critical_stock_threshold: int("critical_stock_threshold").notNull().default(1),
    days_until_stockout_warning: int("days_until_stockout_warning").notNull().default(14),
    reorder_point_multiplier: decimal("reorder_point_multiplier", { precision: 5, scale: 2 })
      .notNull()
      .default("1.5"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("inventory_alert_rules_scope_uidx").on(t.scope_type, t.scope_id),
    index("inventory_alert_rules_active_idx").on(t.is_active),
  ],
);

export const inventory_alerts = mysqlTable(
  "inventory_alerts",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 24 }).notNull(),
    warehouse_id: varchar("warehouse_id", { length: 24 }).notNull().default("default"),
    alert_type: varchar("alert_type", { length: 32 }).notNull(), // low_stock|stockout_predicted|reorder
    severity: varchar("severity", { length: 16 }).notNull(), // info|warning|critical
    message: varchar("message", { length: 512 }).notNull(),
    payload: json("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 16 }).notNull().default("open"), // open|ack|resolved
    notified_at: timestamp("notified_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    resolved_at: timestamp("resolved_at", { mode: "string" }),
  },
  (t) => [
    index("inventory_alerts_status_created_idx").on(t.status, t.created_at),
    index("inventory_alerts_sku_idx").on(t.sku_id, t.alert_type, t.status),
  ],
);

export const inventory_forecast_jobs = mysqlTable(
  "inventory_forecast_jobs",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    job_type: varchar("job_type", { length: 64 }).notNull(),
    // rebuild_velocity | reindex_sku | reindex_batch | evaluate_alerts
    payload: json("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    attempts: int("attempts").notNull().default(0),
    run_after: timestamp("run_after", { mode: "string" }).defaultNow().notNull(),
    last_error: varchar("last_error", { length: 1000 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [index("inventory_forecast_jobs_status_run_idx").on(t.status, t.run_after)],
);
