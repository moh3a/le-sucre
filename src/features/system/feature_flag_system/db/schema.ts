import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { softDeleteColumns } from "@/lib/db/soft-delete-schema";

export const feature_flags = mysqlTable(
  "feature_flags",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    key: varchar("key", { length: 255 }).notNull(),
    name: json("name").$type<{ en: string; fr: string; ar: string }>().notNull(),
    description: json("description")
      .$type<{ en: string; fr: string; ar: string }>()
      .default({ en: "", fr: "", ar: "" }),
    enabled: boolean("enabled").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
    ...softDeleteColumns,
  },
  (t) => [
    uniqueIndex("feature_flags_key_uidx").on(t.key),
    index("feature_flags_deleted_idx").on(t.deleted_at),
  ],
);
