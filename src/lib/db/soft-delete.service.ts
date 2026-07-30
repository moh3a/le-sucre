import "server-only";

import { type Column } from "drizzle-orm";
import { type MySqlTable } from "drizzle-orm/mysql-core";
import { and, eq, inArray, isNotNull, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { logger } from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────

export interface SoftDeleteConfig {
  table: MySqlTable;
  idColumn: Column;
  deletedAtColumn: Column;
  deletedByColumn?: Column;
  restoredAtColumn?: Column;
  restoredByColumn?: Column;
  entityType: string;
}

export interface SoftDeleteResult {
  success: boolean;
  restored?: boolean;
}

type ResultSetHeader = { affectedRows: number };

// ─── Helpers ──────────────────────────────────────────────

function getAffectedRows(result: unknown): number {
  if (result && typeof result === "object" && "affectedRows" in result) {
    return (result as ResultSetHeader).affectedRows;
  }
  return 0;
}

// ─── Service ──────────────────────────────────────────────

export class SoftDeleteService {
  /**
   * Soft-delete a single record by setting deleted_at and deleted_by.
   */
  async softDelete(
    config: SoftDeleteConfig,
    id: string,
    actorUserId: string,
    reason?: string,
  ): Promise<SoftDeleteResult> {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const whereClause = and(eq(config.idColumn, id), isNull(config.deletedAtColumn));

    const updateData: Record<string, unknown> = {
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

    const result = await db.update(config.table).set(updateData).where(whereClause);

    if (getAffectedRows(result) === 0) {
      return { success: false };
    }

    void audit_service.log({
      action: `${config.entityType}.soft_delete`,
      resource_type: config.entityType,
      resource_id: id,
      metadata: reason ? { reason } : undefined,
    });

    return { success: true };
  }

  /**
   * Restore a soft-deleted record by clearing deleted_at and deleted_by.
   */
  async restore(
    config: SoftDeleteConfig,
    id: string,
    actorUserId: string,
  ): Promise<SoftDeleteResult> {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const whereClause = and(eq(config.idColumn, id), isNotNull(config.deletedAtColumn));

    const updateData: Record<string, unknown> = {
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

    const result = await db.update(config.table).set(updateData).where(whereClause);

    if (getAffectedRows(result) === 0) {
      return { success: false };
    }

    void audit_service.log({
      action: `${config.entityType}.restore`,
      resource_type: config.entityType,
      resource_id: id,
    });

    return { success: true };
  }

  /**
   * Permanently delete a record from the database (force delete).
   */
  async forceDelete(config: SoftDeleteConfig, id: string): Promise<SoftDeleteResult> {
    const result = await db.delete(config.table).where(eq(config.idColumn, id));

    if (getAffectedRows(result) === 0) {
      return { success: false };
    }

    void audit_service.log({
      action: `${config.entityType}.force_delete`,
      resource_type: config.entityType,
      resource_id: id,
    });

    return { success: true };
  }

  /**
   * Permanently delete records that have been soft-deleted and passed the retention period.
   */
  async cleanupExpired(
    config: SoftDeleteConfig,
    retentionDays: number,
    batchSize = 100,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffStr = cutoffDate.toISOString().slice(0, 19).replace("T", " ");

    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const expiredIds = await db
          // @ts-expect-error TSB
          .select({ id: config.idColumn })
          .from(config.table)
          .where(and(isNotNull(config.deletedAtColumn), lt(config.deletedAtColumn, cutoffStr)))
          .limit(batchSize);

        if (expiredIds.length === 0) {
          hasMore = false;
          break;
        }

        const ids: string[] = expiredIds.map((row) => row.id as string);

        await db.delete(config.table).where(inArray(config.idColumn, ids));

        totalDeleted += ids.length;

        if (ids.length < batchSize) {
          hasMore = false;
        }
      } catch (error) {
        logger.error("soft_delete_cleanup_error", {
          entityType: config.entityType,
          message: error instanceof Error ? error.message : "unknown",
        });
        hasMore = false;
      }
    }

    if (totalDeleted > 0) {
      void audit_service.log({
        action: `${config.entityType}.cleanup`,
        resource_type: config.entityType,
        metadata: { deleted_count: totalDeleted, retention_days: retentionDays },
      });
    }

    return totalDeleted;
  }

  /**
   * Batch soft-delete multiple records.
   */
  async batchSoftDelete(
    config: SoftDeleteConfig,
    ids: string[],
    actorUserId: string,
  ): Promise<number> {
    if (ids.length === 0) return 0;

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const updateData: Record<string, unknown> = {
      [config.deletedAtColumn.name]: now,
    };
    if (config.deletedByColumn) {
      updateData[config.deletedByColumn.name] = actorUserId;
    }

    const result = await db
      .update(config.table)
      .set(updateData)
      .where(and(inArray(config.idColumn, ids), isNull(config.deletedAtColumn)));

    const affectedRows = getAffectedRows(result);

    if (affectedRows > 0) {
      void audit_service.log({
        action: `${config.entityType}.batch_soft_delete`,
        resource_type: config.entityType,
        metadata: { count: affectedRows, ids },
      });
    }

    return affectedRows;
  }

  /**
   * Batch restore multiple records.
   */
  async batchRestore(
    config: SoftDeleteConfig,
    ids: string[],
    actorUserId: string,
  ): Promise<number> {
    if (ids.length === 0) return 0;

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const updateData: Record<string, unknown> = {
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

    const result = await db
      .update(config.table)
      .set(updateData)
      .where(and(inArray(config.idColumn, ids), isNotNull(config.deletedAtColumn)));

    const affectedRows = getAffectedRows(result);

    if (affectedRows > 0) {
      void audit_service.log({
        action: `${config.entityType}.batch_restore`,
        resource_type: config.entityType,
        metadata: { count: affectedRows, ids },
      });
    }

    return affectedRows;
  }
}

export const soft_delete_service = new SoftDeleteService();
