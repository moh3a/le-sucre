import "server-only";

import { and, count, desc, eq, like, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { brands } from "../schema";

export class BrandRepository {
  async find_by_id(id: string) {
    const [row] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_slug(slug: string) {
    const [row] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
    return row ?? null;
  }

  async list(params: { page: number; limit: number; search?: string; is_active?: boolean }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const filters: ReturnType<typeof eq>[] = [];
    if (params.is_active !== undefined) filters.push(eq(brands.is_active, params.is_active));
    if (params.search) {
      const q = `%${params.search}%`;
      filters.push(or(like(brands.name, q), like(brands.slug, q))!);
    }
    const where = filters.length ? and(...filters) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(brands)
        .where(where)
        .orderBy(desc(brands.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(brands).where(where),
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

  async list_active() {
    return db.select().from(brands).where(eq(brands.is_active, true)).orderBy(brands.name);
  }

  async count_by_active() {
    const [active_result, inactive_result] = await Promise.all([
      db.select({ count: count() }).from(brands).where(eq(brands.is_active, true)),
      db.select({ count: count() }).from(brands).where(eq(brands.is_active, false)),
    ]);
    return {
      active: Number(active_result[0].count ?? 0),
      inactive: Number(inactive_result[0].count ?? 0),
    };
  }

  create(data: typeof brands.$inferInsert) {
    return db.insert(brands).values(data);
  }

  update(id: string, data: Partial<typeof brands.$inferInsert>) {
    return db.update(brands).set(data).where(eq(brands.id, id));
  }

  delete(id: string) {
    return db.delete(brands).where(eq(brands.id, id));
  }
}

export const brand_repository = new BrandRepository();
