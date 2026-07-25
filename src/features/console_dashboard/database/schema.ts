import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export const database_history = mysqlTable(
  "database_history",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    operation_type: varchar("operation_type", { length: 32 }).notNull(),
    query: text("query"),
    table_name: varchar("table_name", { length: 255 }),
    status: varchar("status", { length: 16 }).notNull().default("success"),
    rows_affected: varchar("rows_affected", { length: 16 }),
    duration_ms: varchar("duration_ms", { length: 16 }),
    error_message: text("error_message"),
    file_name: varchar("file_name", { length: 255 }),
    file_format: varchar("file_format", { length: 16 }),
    executed_by: varchar("executed_by", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("db_history_type_idx").on(t.operation_type),
    index("db_history_status_idx").on(t.status),
    index("db_history_created_idx").on(t.created_at),
  ],
);
