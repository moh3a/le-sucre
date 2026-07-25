import { timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Reusable soft delete columns for any table that supports deletion lifecycle.
 * Apply these columns via spread: `...softDeleteColumns`
 */
export const softDeleteColumns = {
  deleted_at: timestamp("deleted_at", { mode: "string" }),
  deleted_by: varchar("deleted_by", { length: 255 }),
  restored_at: timestamp("restored_at", { mode: "string" }),
  restored_by: varchar("restored_by", { length: 255 }),
};

/**
 * Column names for soft delete fields.
 * Use these when referencing columns dynamically in queries.
 */
export const SOFT_DELETE_FIELDS = {
  deleted_at: "deleted_at",
  deleted_by: "deleted_by",
  restored_at: "restored_at",
  restored_by: "restored_by",
} as const;
