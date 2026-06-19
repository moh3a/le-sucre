import { boolean, index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    reference_type: varchar("reference_type", { length: 32 }),
    reference_id: varchar("reference_id", { length: 255 }),
    is_read: boolean("is_read").notNull().default(false),
    read_at: timestamp("read_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("notifications_user_unread_idx").on(t.user_id, t.is_read, t.created_at),
    index("notifications_type_idx").on(t.type),
  ],
);
