import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export const settings = mysqlTable(
  "settings",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value"),
    category: varchar("category", { length: 64 }).notNull().default("general"),
    updated_by: varchar("updated_by", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [index("settings_key_uidx").on(t.key), index("settings_category_idx").on(t.category)],
);
