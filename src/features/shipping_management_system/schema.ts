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
import { orders } from "@/features/order_management_system/orders/schema";

export const shipments = mysqlTable(
  "shipments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    provider: varchar("provider", { length: 32 }).notNull(), // yalidine | dhl | fedex | ups | ems
    provider_shipment_id: varchar("provider_shipment_id", { length: 128 }),
    tracking_number: varchar("tracking_number", { length: 128 }),
    tracking_url: varchar("tracking_url", { length: 2048 }),

    status: varchar("status", { length: 32 }).notNull().default("draft"),
    delivery_status: varchar("delivery_status", { length: 32 }).notNull().default("pending"),

    shipping_cost: decimal("shipping_cost", { precision: 12, scale: 2 }).notNull().default("0"),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),

    recipient_name: varchar("recipient_name", { length: 255 }).notNull(),
    recipient_phone: varchar("recipient_phone", { length: 32 }).notNull(),
    address_line1: varchar("address_line1", { length: 255 }).notNull(),
    address_line2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 128 }).notNull(),
    state: varchar("state", { length: 128 }),
    postal_code: varchar("postal_code", { length: 32 }),
    country_code: varchar("country_code", { length: 2 }).notNull().default("DZ"),

    package_weight_kg: decimal("package_weight_kg", { precision: 8, scale: 3 }),
    package_length_cm: int("package_length_cm"),
    package_width_cm: int("package_width_cm"),
    package_height_cm: int("package_height_cm"),

    is_cod: boolean("is_cod").notNull().default(true),
    cod_amount: decimal("cod_amount", { precision: 12, scale: 2 }),

    last_sync_at: timestamp("last_sync_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),

    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("shipments_order_uidx").on(t.order_id),
    index("shipments_provider_status_idx").on(t.provider, t.status),
    index("shipments_tracking_idx").on(t.tracking_number),
    index("shipments_delivery_status_idx").on(t.delivery_status, t.updated_at),
  ],
);

export const shipment_tracking_events = mysqlTable(
  "shipment_tracking_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    shipment_id: varchar("shipment_id", { length: 255 })
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    provider_event_id: varchar("provider_event_id", { length: 128 }),
    status: varchar("status", { length: 64 }).notNull(),
    description: varchar("description", { length: 512 }),
    location: varchar("location", { length: 255 }),
    occurred_at: timestamp("occurred_at", { mode: "string" }).notNull(),
    raw_payload: json("raw_payload").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("shipment_tracking_unique_event_uidx").on(t.shipment_id, t.provider_event_id),
    index("shipment_tracking_shipment_time_idx").on(t.shipment_id, t.occurred_at),
  ],
);

export const shipping_jobs = mysqlTable(
  "shipping_jobs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    job_type: varchar("job_type", { length: 64 }).notNull(), // sync_tracking | dispatch_retry
    shipment_id: varchar("shipment_id", { length: 255 }).references(() => shipments.id, {
      onDelete: "cascade",
    }),
    provider: varchar("provider", { length: 32 }),
    payload: json("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 32 }).notNull().default("pending"), // pending | processing | done | failed
    attempts: int("attempts").notNull().default(0),
    max_attempts: int("max_attempts").notNull().default(6),
    run_at: timestamp("run_at", { mode: "string" }).notNull(),
    last_error: varchar("last_error", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("shipping_jobs_poll_idx").on(t.status, t.run_at),
    index("shipping_jobs_shipment_idx").on(t.shipment_id, t.job_type),
  ],
);
