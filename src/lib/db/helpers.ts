import { and, asc, desc, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
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

// ─── Soft delete filters ──────────────────────────────────

/** Returns active (non-deleted) records */
export function notDeleted(deletedAtColumn: MySqlColumn): SQL {
  return isNull(deletedAtColumn);
}

/** Returns only soft-deleted records */
export function onlyDeleted(deletedAtColumn: MySqlColumn): SQL {
  return isNotNull(deletedAtColumn);
}

/** Returns all records regardless of delete status */
export function withDeleted(): undefined {
  return undefined;
}

/** Returns the active filter unless deleted records should be included */
export function softDeleteFilter(
  deletedAtColumn: MySqlColumn,
  includeDeleted?: boolean,
): SQL | undefined {
  if (includeDeleted) return undefined;
  return notDeleted(deletedAtColumn);
}

/** Type for soft-deletable table columns */
export interface SoftDeletableColumns {
  deleted_at: MySqlColumn;
  deleted_by?: MySqlColumn;
  restored_at?: MySqlColumn;
  restored_by?: MySqlColumn;
}

/** Build soft delete SET clause */
export function buildSoftDeleteSet(actorUserId?: string) {
  return {
    deleted_at: sql`now()`,
    ...(actorUserId ? { deleted_by: actorUserId } : {}),
  };
}

/** Build restore SET clause */
export function buildRestoreSet(actorUserId?: string) {
  return {
    deleted_at: null,
    deleted_by: null,
    restored_at: sql`now()`,
    ...(actorUserId ? { restored_by: actorUserId } : {}),
  };
}

/** Build soft delete WHERE clause */
export function buildSoftDeleteWhere(
  idColumn: MySqlColumn,
  id: string,
  deletedAtColumn: MySqlColumn,
): SQL | undefined {
  return and(eq(idColumn, id), isNull(deletedAtColumn));
}

/** Build restore WHERE clause (only deleted records) */
export function buildRestoreWhere(
  idColumn: MySqlColumn,
  id: string,
  deletedAtColumn: MySqlColumn,
): SQL | undefined {
  return and(eq(idColumn, id), isNotNull(deletedAtColumn));
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
