import { mysqlTable, varchar, text, boolean, timestamp, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";

export const blacklisted_ips = mysqlTable(
  "blacklisted_ips",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    ip_address: varchar("ip_address", { length: 45 }).notNull(),
    reason: text("reason"),
    reason_fr: text("reason_fr"),
    reason_ar: text("reason_ar"),
    is_active: boolean("is_active").default(true).notNull(),
    expires_at: timestamp("expires_at", { mode: "date", fsp: 3 }),
    created_by: varchar("created_by", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("blacklisted_ips_ip_idx").on(table.ip_address),
    index("blacklisted_ips_active_idx").on(table.is_active),
    index("blacklisted_ips_expires_idx").on(table.expires_at),
  ],
);

export const blacklistedIpsRelations = relations(blacklisted_ips, ({ one }) => ({
  creator: one(users, {
    fields: [blacklisted_ips.created_by],
    references: [users.id],
  }),
}));

export type BlacklistedIp = typeof blacklisted_ips.$inferSelect;
export type NewBlacklistedIp = typeof blacklisted_ips.$inferInsert;
