import "server-only";

import { and, count, desc, eq, isNotNull, isNull, like, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories } from "../schema";

export class CategoryRepository {
  async find_by_id(id: string, includeDeleted = false) {
    const filters: SQL<unknown>[] = [eq(categories.id, id)];
    if (!includeDeleted) filters.push(isNull(categories.deleted_at));
    const r = await db.select().from(categories).where(and(...filters)).limit(1);
    return r[0] ?? null;
  }

  async find_by_slug(slug: string, includeDeleted = false) {
    const filters: SQL<unknown>[] = [eq(categories.slug, slug)];
    if (!includeDeleted) filters.push(isNull(categories.deleted_at));
    const r = await db.select().from(categories).where(and(...filters)).limit(1);
    return r[0] ?? null;
  }

  async list_flat(params: {
    parent_id?: string | null;
    is_active?: boolean;
    is_featured?: boolean;
    search?: string;
    page: number;
    limit: number;
    includeDeleted?: boolean;
  }) {
    const filters: SQL<unknown>[] = [];
    if (!params.includeDeleted) filters.push(isNull(categories.deleted_at));
    if (params.parent_id !== undefined) {
      filters.push(
        params.parent_id === null
          ? sql`${categories.parent_id} IS NULL`
          : eq(categories.parent_id, params.parent_id),
      );
    }
    if (params.is_active !== undefined) filters.push(eq(categories.is_active, params.is_active));
    if (params.is_featured !== undefined)
      filters.push(eq(categories.is_featured, params.is_featured));
    if (params.search) {
      const q = `%${params.search}%`;
      const search_or = or(like(categories.name, q), like(categories.slug, q));
      if (search_or) filters.push(search_or);
    }
    const where = filters.length ? and(...filters) : undefined;
    const offset = (params.page - 1) * params.limit;

    return await Promise.all([
      db
        .select()
        .from(categories)
        .where(where)
        .orderBy(categories.depth, categories.sort_order)
        .limit(params.limit)
        .offset(offset),
      db.select({ total: count() }).from(categories).where(where),
    ]).then(([items, [{ total }]]) => ({
      items,
      meta: {
        page: params.page,
        limit: params.limit,
        total_records: Number(total),
        total_pages: Math.ceil(Number(total) / params.limit) || 1,
      },
    }));
  }

  async list_all_for_tree(active_only = false) {
    const filters: SQL<unknown>[] = [isNull(categories.deleted_at)];
    if (active_only) filters.push(eq(categories.is_active, true));
    return await db
      .select()
      .from(categories)
      .where(and(...filters))
      .orderBy(categories.depth, categories.sort_order);
  }

  async insert(values: typeof categories.$inferInsert) {
    return await db.insert(categories).values(values);
  }

  async update(id: string, values: Partial<typeof categories.$inferInsert>) {
    return await db.update(categories).set(values).where(eq(categories.id, id));
  }

  /** Soft delete - only works on non-deleted records */
  async soft_delete(id: string, actorUserId?: string) {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    return db
      .update(categories)
      .set({
        deleted_at: now,
        ...(actorUserId ? { deleted_by: actorUserId } : {}),
      })
      .where(and(eq(categories.id, id), isNull(categories.deleted_at)));
  }

  /** Restore a soft-deleted record */
  async restore(id: string, actorUserId?: string) {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    return db
      .update(categories)
      .set({
        deleted_at: null,
        deleted_by: null,
        restored_at: now,
        ...(actorUserId ? { restored_by: actorUserId } : {}),
      })
      .where(and(eq(categories.id, id), isNotNull(categories.deleted_at)));
  }

  /** Permanently delete (force) */
  async force_delete(id: string) {
    return await db.delete(categories).where(eq(categories.id, id));
  }

  /** List soft-deleted records (trash) */
  async list_deleted(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const where = isNotNull(categories.deleted_at);

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          deleted_at: categories.deleted_at,
          deleted_by: categories.deleted_by,
        })
        .from(categories)
        .where(where)
        .orderBy(desc(categories.deleted_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(categories).where(where),
    ]);

    const total_records = Number(total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.ceil(total_records / limit) || 1,
        has_more: page * limit < total_records,
      },
    };
  }

  async count_direct_children(parent_id: string) {
    return await db
      .select({ total: count() })
      .from(categories)
      .where(and(eq(categories.parent_id, parent_id), isNull(categories.deleted_at)));
  }

  async get_stats() {
    const [result] = await db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${categories.is_active} = 1 THEN 1 ELSE NULL END`),
        inactive: count(sql`CASE WHEN ${categories.is_active} = 0 THEN 1 ELSE NULL END`),
        root: count(sql`CASE WHEN ${categories.parent_id} IS NULL THEN 1 ELSE NULL END`),
      })
      .from(categories)
      .where(isNull(categories.deleted_at));

    return {
      total: Number(result?.total ?? 0),
      active: Number(result?.active ?? 0),
      inactive: Number(result?.inactive ?? 0),
      root: Number(result?.root ?? 0),
    };
  }
}

export const category_repository = new CategoryRepository();
