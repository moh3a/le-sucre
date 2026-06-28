import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  text,
  date,
  mysqlEnum,
  decimal,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";

// ==========================================
// 1. USER PROFILES TABLE
// ==========================================
export const user_profiles = mysqlTable(
  "user_profiles",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    first_name: varchar("first_name", { length: 255 }),
    last_name: varchar("last_name", { length: 255 }),
    phone_secondary: varchar("phone_secondary", { length: 50 }),
    date_of_birth: date("date_of_birth", { mode: "string" }),
    gender: mysqlEnum("gender", ["male", "female", "other"]),
    company: varchar("company", { length: 255 }),
    tax_id: varchar("tax_id", { length: 100 }),
    vat_number: varchar("vat_number", { length: 100 }),
    default_billing_address_id: varchar("default_billing_address_id", { length: 255 }),
    default_shipping_address_id: varchar("default_shipping_address_id", { length: 255 }),
    newsletter_opt_in: boolean("newsletter_opt_in").default(false).notNull(),
    marketing_opt_in: boolean("marketing_opt_in").default(false).notNull(),
    sms_notifications: boolean("sms_notifications").default(false).notNull(),
    push_notifications: boolean("push_notifications").default(true).notNull(),
    preferred_language: varchar("preferred_language", { length: 10 }).default("fr").notNull(),
    preferred_currency: varchar("preferred_currency", { length: 3 }).default("DZD").notNull(),
    bio: text("bio"),
    notes: text("notes"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_profiles_user_id_uidx").on(table.user_id),
  ],
);

// ==========================================
// 2. USER ADDRESSES TABLE
// ==========================================
export const user_addresses = mysqlTable(
  "user_addresses",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 100 }), // "Home", "Office", etc.
    type: mysqlEnum("type", ["shipping", "billing", "both"]).default("both").notNull(),
    first_name: varchar("first_name", { length: 255 }),
    last_name: varchar("last_name", { length: 255 }),
    company: varchar("company", { length: 255 }),
    address_line_1: varchar("address_line_1", { length: 500 }),
    address_line_2: varchar("address_line_2", { length: 500 }),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 255 }),
    postal_code: varchar("postal_code", { length: 50 }),
    country: varchar("country", { length: 100 }).default("Algeria").notNull(),
    phone: varchar("phone", { length: 50 }),
    instructions: text("instructions"),
    is_default: boolean("is_default").default(false).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("user_addresses_user_id_idx").on(table.user_id),
    index("user_addresses_city_idx").on(table.city),
  ],
);

// ==========================================
// DRIZZLE RELATIONS
// ==========================================
export const userProfilesRelations = relations(user_profiles, ({ one }) => ({
  user: one(users, {
    fields: [user_profiles.user_id],
    references: [users.id],
  }),
}));

export const userAddressesRelations = relations(user_addresses, ({ one }) => ({
  user: one(users, {
    fields: [user_addresses.user_id],
    references: [users.id],
  }),
}));
