import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  text,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";

// ==========================================
// 1. USERS TABLE
// ==========================================
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    email_verified: boolean("email_verified").default(false).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    image: varchar("image", { length: 2048 }),
    is_active: boolean("is_active").default(true).notNull(),
    role: text("role"),
    banned: boolean("banned"),
    ban_reason: text("ban_reason"),
    ban_expires: timestamp("ban_expires", { mode: "date", fsp: 3 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("email_uidx").on(table.email),
    uniqueIndex("phone_uidx").on(table.phone),
    index("users_created_at_idx").on(table.created_at),
  ],
);

// ==========================================
// 2. SESSIONS TABLE (Better Auth)
// ==========================================
export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    expires_at: timestamp("expires_at", { mode: "string" }).notNull(),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: varchar("user_agent", { length: 1024 }),
    impersonated_by: text("impersonated_by"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_uidx").on(table.token),
    index("sessions_user_idx").on(table.user_id),
  ],
);

// ==========================================
// 3. ACCOUNTS TABLE (Better Auth)
// ==========================================
export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    account_id: varchar("account_id", { length: 255 }).notNull(),
    provider_id: varchar("provider_id", { length: 255 }).notNull(),
    password: text("password"),
    access_token: text("access_token"),
    refresh_token: text("refresh_token"),
    id_token: text("id_token"),
    access_token_expires_at: timestamp("access_token_expires_at", { mode: "string" }),
    refresh_token_expires_at: timestamp("refresh_token_expires_at", { mode: "string" }),
    scope: varchar("scope", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_uidx").on(table.provider_id, table.account_id),
    index("accounts_user_idx").on(table.user_id),
  ],
);

// ==========================================
// 4. VERIFICATIONS TABLE (Better Auth)
// ==========================================
export const verifications = mysqlTable(
  "verifications",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expires_at: timestamp("expires_at", { mode: "string" }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

// ==========================================
// 5. ROLES TABLE
// ==========================================
export const roles = mysqlTable(
  "roles",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 100 }).notNull(),
    description: varchar("description", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("roles_name_uidx").on(table.name)],
);

// ==========================================
// 6. PERMISSIONS TABLE
// ==========================================
export const permissions = mysqlTable(
  "permissions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 100 }).notNull(), // e.g. "product:create"
    description: varchar("description", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("permissions_name_uidx").on(table.name)],
);

// ==========================================
// 7. USER_ROLES TABLE (Many-to-Many Bridge)
// ==========================================
export const user_roles = mysqlTable(
  "user_roles",
  {
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role_id: varchar("role_id", { length: 255 })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.user_id, table.role_id] }),
    index("user_roles_role_id_idx").on(table.role_id),
  ],
);

// ==========================================
// 8. ROLE_PERMISSIONS TABLE (Many-to-Many Bridge)
// ==========================================
export const role_permissions = mysqlTable(
  "role_permissions",
  {
    role_id: varchar("role_id", { length: 255 })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission_id: varchar("permission_id", { length: 255 })
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.role_id, table.permission_id] }),
    index("role_permissions_permission_id_idx").on(table.permission_id),
  ],
);

export const audit_logs = mysqlTable(
  "audit_logs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    actor_user_id: varchar("actor_user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 100 }).notNull(),
    resource_type: varchar("resource_type", { length: 100 }),
    resource_id: varchar("resource_id", { length: 255 }),
    metadata: text("metadata"),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: varchar("user_agent", { length: 1024 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actor_user_id),
    index("audit_logs_action_idx").on(t.action),
  ],
);

// ==========================================
// DRIZZLE RELATIONS MAPPINGS
// ==========================================
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  user_roles: many(user_roles),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.user_id],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  user_roles: many(user_roles),
  role_permissions: many(role_permissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  role_permissions: many(role_permissions),
}));

export const userRolesRelations = relations(user_roles, ({ one }) => ({
  user: one(users, {
    fields: [user_roles.user_id],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [user_roles.role_id],
    references: [roles.id],
  }),
}));

export const rolePermissionsRelations = relations(role_permissions, ({ one }) => ({
  role: one(roles, {
    fields: [role_permissions.role_id],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [role_permissions.permission_id],
    references: [permissions.id],
  }),
}));
