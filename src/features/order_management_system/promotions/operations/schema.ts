import { index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export const promotion_reviews = mysqlTable(
  "promotion_reviews",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 255 }).notNull(),
    review_type: varchar("review_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    reviewer_user_id: varchar("reviewer_user_id", { length: 255 }),
    review_note: varchar("review_note", { length: 512 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("promotion_reviews_promotion_idx").on(t.promotion_id),
    index("promotion_reviews_status_idx").on(t.status),
  ],
);
