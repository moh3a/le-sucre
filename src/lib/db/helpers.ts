import { and, asc, desc, isNull, sql, type SQL } from "drizzle-orm";
import { type MySqlColumn } from "drizzle-orm/mysql-core";
import { SortOrder } from "../types";

// ─── Pagination ───────────────────────────────────────────
export function withPagination(page: number, perPage: number) {
  return {
    limit: perPage,
    offset: (page - 1) * perPage,
  };
}

export function buildPaginationMeta(total: number, page: number, perPage: number) {
  return {
    page,
    per_page: perPage,
    total,
    total_pages: Math.ceil(total / perPage),
  };
}

// ─── Ordering ─────────────────────────────────────────────
export function withOrder(column: MySqlColumn, order: SortOrder = "desc") {
  return order === "asc" ? asc(column) : desc(column);
}

// ─── Count query ──────────────────────────────────────────
export const countSql = sql<number>`count(*)`;

// ─── Soft delete filter ───────────────────────────────────
export function notDeleted(deletedAtColumn: MySqlColumn): SQL {
  return isNull(deletedAtColumn);
}

// ─── CUID default ─────────────────────────────────────────
export function cuidDefault() {
  return sql`(uuid_to_bin(uuid()))`;
}

// ─── Timestamps ───────────────────────────────────────────
export const timestamps = {
  created_at: sql`(now())`,
  updated_at: sql`(now()) ON UPDATE now()`,
};

// ─── JSON stringify helper ────────────────────────────────
export function toJsonColumn<T>(value: T): string {
  return JSON.stringify(value);
}

export function fromJsonColumn<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// ─── Combine WHERE clauses ────────────────────────────────
export function buildWhere(...conditions: (SQL | undefined)[]): SQL | undefined {
  const valid = conditions.filter(Boolean) as SQL[];
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return and(...valid);
}
