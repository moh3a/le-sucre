import { z } from "zod";
import { eq, isNotNull, isNull, and, type SQL } from "drizzle-orm";
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core";
import { db } from "@/lib/db";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

// ─── Soft Delete Router Helpers ───────────────────────────

export interface SoftDeleteRouterConfig {
  table: MySqlTable;
  idColumn: MySqlColumn;
  deletedAtColumn: MySqlColumn;
  deletedByColumn?: MySqlColumn;
  restoredAtColumn?: MySqlColumn;
  restoredByColumn?: MySqlColumn;
  entityType: string;
}

/**
 * Create a standard soft-delete mutation handler for a tRPC router.
 * Returns a mutation that sets deleted_at and deleted_by.
 */
export function createSoftDeleteHandler(config: SoftDeleteRouterConfig) {
  return async ({
    input,
    ctx,
  }: {
    input: { id: string };
    ctx: { session: { user: { id: string } } };
  }) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const actorUserId = ctx.session.user.id;

    const whereClause = and(
      eq(config.idColumn as any, input.id),
      isNull(config.deletedAtColumn),
    );

    const updateData: Record<string, any> = {
      [config.deletedAtColumn.name]: now,
    };
    if (config.deletedByColumn) {
      updateData[config.deletedByColumn.name] = actorUserId;
    }
    if (config.restoredAtColumn) {
      updateData[config.restoredAtColumn.name] = null;
    }
    if (config.restoredByColumn) {
      updateData[config.restoredByColumn.name] = null;
    }

    await db.update(config.table).set(updateData).where(whereClause);

    void audit_service.log({
      action: `${config.entityType}.soft_delete`,
      resource_type: config.entityType,
      resource_id: input.id,
    });

    return { success: true };
  };
}

/**
 * Create a standard restore mutation handler for a tRPC router.
 * Returns a mutation that clears deleted_at and deleted_by.
 */
export function createRestoreHandler(config: SoftDeleteRouterConfig) {
  return async ({
    input,
    ctx,
  }: {
    input: { id: string };
    ctx: { session: { user: { id: string } } };
  }) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const actorUserId = ctx.session.user.id;

    const whereClause = and(
      eq(config.idColumn as any, input.id),
      isNotNull(config.deletedAtColumn),
    );

    const updateData: Record<string, any> = {
      [config.deletedAtColumn.name]: null,
    };
    if (config.deletedByColumn) {
      updateData[config.deletedByColumn.name] = null;
    }
    if (config.restoredAtColumn) {
      updateData[config.restoredAtColumn.name] = now;
    }
    if (config.restoredByColumn) {
      updateData[config.restoredByColumn.name] = actorUserId;
    }

    await db.update(config.table).set(updateData).where(whereClause);

    void audit_service.log({
      action: `${config.entityType}.restore`,
      resource_type: config.entityType,
      resource_id: input.id,
    });

    return { success: true };
  };
}

/**
 * Create a standard force-delete mutation handler.
 * Permanently removes the record.
 */
export function createForceDeleteHandler(config: SoftDeleteRouterConfig) {
  return async ({
    input,
    ctx,
  }: {
    input: { id: string };
    ctx: { session: { user: { id: string } } };
  }) => {
    const actorUserId = ctx.session.user.id;

    await db.delete(config.table).where(eq(config.idColumn as any, input.id));

    void audit_service.log({
      action: `${config.entityType}.force_delete`,
      resource_type: config.entityType,
      resource_id: input.id,
    });

    return { success: true };
  };
}

/**
 * Create a standard trash list query handler.
 * Returns soft-deleted records for a given table.
 */
export function createTrashListHandler(
  config: SoftDeleteRouterConfig,
  options?: {
    select?: (table: MySqlTable) => Record<string, any>;
    additionalWhere?: (table: MySqlTable) => SQL;
    orderBy?: MySqlColumn;
  },
) {
  return async ({
    input,
  }: {
    input: { page?: number; limit?: number; search?: string };
  }) => {
    const { page = 1, limit = 20 } = input;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [isNotNull(config.deletedAtColumn)];

    const selectCols = options?.select
      ? options.select(config.table)
      : { id: config.idColumn };

    const query = db
      .select(selectCols)
      .from(config.table)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    const items = await query;

    return {
      items,
      meta: {
        page,
        limit,
        total_records: items.length,
        total_pages: Math.ceil(items.length / limit),
        has_more: items.length === limit,
      },
    };
  };
}

// ─── Standard input schemas ───────────────────────────────

export const softDeleteInput = z.object({
  id: z.string().min(1),
});

export const restoreInput = z.object({
  id: z.string().min(1),
});

export const forceDeleteInput = z.object({
  id: z.string().min(1),
});

export const trashListInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const batchSoftDeleteInput = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});

export const batchRestoreInput = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});
