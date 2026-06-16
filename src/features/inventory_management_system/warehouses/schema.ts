import { generate_id } from "@/lib/utils";
import { boolean, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const warehouses = mysqlTable(
  "warehouses",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    location: text("location"),
    phone: varchar("phone", { length: 32 }),
    email: varchar("email", { length: 255 }),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("warehouses_slug_uidx").on(t.slug)],
);
