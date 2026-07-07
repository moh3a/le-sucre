import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export const contact_messages = mysqlTable(
  "contact_messages",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    locale: varchar("locale", { length: 5 }).notNull().default("fr"),
    user_id: varchar("user_id", { length: 255 }),
    ip_hash: varchar("ip_hash", { length: 64 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("contact_messages_created_idx").on(t.created_at),
    index("contact_messages_email_idx").on(t.email),
  ],
);
