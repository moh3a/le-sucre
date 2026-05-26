import "server-only";

import { and, count, eq, like, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories } from "../schema";

export class CategoryRepository {
  async find_by_id(id: string) {
    const r = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return r[0] ?? null;
  }

  async find_by_slug(slug: string) {
    const r = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return r[0] ?? null;
  }

  async list_flat(params: {
    parent_id?: string | null;
    is_active?: boolean;
    search?: string;
    page: number;
    limit: number;
  }) {
    const filters = [];
    if (params.parent_id !== undefined) {
      filters.push(
        params.parent_id === null
          ? sql`${categories.parent_id} IS NULL`
          : eq(categories.parent_id, params.parent_id),
      );
    }
    if (params.is_active !== undefined) filters.push(eq(categories.is_active, params.is_active));
    if (params.search) {
      const q = `%${params.search}%`;
      filters.push(or(like(categories.name, q), like(categories.slug, q))!);
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
    return await db
      .select()
      .from(categories)
      .where(active_only ? eq(categories.is_active, true) : undefined)
      .orderBy(categories.depth, categories.sort_order);
  }

  async insert(values: typeof categories.$inferInsert) {
    return await db.insert(categories).values(values);
  }

  async update(id: string, values: Partial<typeof categories.$inferInsert>) {
    return await db.update(categories).set(values).where(eq(categories.id, id));
  }

  async delete(id: string) {
    return await db.delete(categories).where(eq(categories.id, id));
  }

  async count_direct_children(parent_id: string) {
    return await db
      .select({ total: count() })
      .from(categories)
      .where(eq(categories.parent_id, parent_id));
  }
}

export const category_repository = new CategoryRepository();
