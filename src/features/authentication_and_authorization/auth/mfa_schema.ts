import { mysqlTable, varchar, timestamp, boolean, text, index } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { users } from "./schema";

export const mfa_settings = mysqlTable(
  "mfa_settings",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    method: varchar("method", { length: 20 }).notNull().default("totp"),
    totp_secret: varchar("totp_secret", { length: 255 }),
    is_enabled: boolean("is_enabled").default(false).notNull(),
    last_verified_at: timestamp("last_verified_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("mfa_settings_user_idx").on(table.user_id),
  ],
);

export const mfa_backup_codes = mysqlTable(
  "mfa_backup_codes",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code_hash: varchar("code_hash", { length: 255 }).notNull(),
    is_used: boolean("is_used").default(false).notNull(),
    used_at: timestamp("used_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("mfa_backup_codes_user_idx").on(table.user_id),
  ],
);

export const consent_logs = mysqlTable(
  "consent_logs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    consent_type: varchar("consent_type", { length: 100 }).notNull(),
    granted: boolean("granted").notNull(),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: varchar("user_agent", { length: 1024 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("consent_logs_user_idx").on(table.user_id),
    index("consent_logs_type_idx").on(table.consent_type),
  ],
);

export const pending_email_verifications = mysqlTable(
  "pending_email_verifications",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    token_hash: varchar("token_hash", { length: 255 }).notNull(),
    expires_at: timestamp("expires_at", { mode: "string" }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("pending_email_verifications_user_idx").on(table.user_id),
    index("pending_email_verifications_token_idx").on(table.token_hash),
  ],
);

export const rate_limit_events = mysqlTable(
  "rate_limit_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    ip_address: varchar("ip_address", { length: 45 }),
    user_id: varchar("user_id", { length: 255 }),
    blocked: boolean("blocked").default(false).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("rate_limit_events_identifier_idx").on(table.identifier),
    index("rate_limit_events_action_idx").on(table.action),
    index("rate_limit_events_created_idx").on(table.created_at),
  ],
);

export const security_events = mysqlTable(
  "security_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    event_type: varchar("event_type", { length: 100 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull().default("info"),
    user_id: varchar("user_id", { length: 255 }),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: varchar("user_agent", { length: 1024 }),
    metadata: text("metadata"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("security_events_type_idx").on(table.event_type),
    index("security_events_user_idx").on(table.user_id),
    index("security_events_created_idx").on(table.created_at),
  ],
);
