import { mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";

export const system_status = mysqlTable("system_status", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => "singleton"),
  initialized: boolean("initialized").notNull().default(false),
  initialized_at: timestamp("initialized_at", { mode: "string" }),
  version: varchar("version", { length: 32 }),
  admin_user_id: varchar("admin_user_id", { length: 255 }),
  created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
});
