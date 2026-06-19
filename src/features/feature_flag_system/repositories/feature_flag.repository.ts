import "server-only";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { feature_flags } from "../schema";

export class FeatureFlagRepository {
  async list(page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;
    const clauses = [];

    if (search) clauses.push(ilike(feature_flags.key, `%${search}%`));

    const where = clauses.length ? and(...clauses) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(feature_flags)
        .where(where)
        .orderBy(desc(feature_flags.updated_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(feature_flags)
        .where(where),
    ]);

    const total = Number(count);
    return {
      items: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async stats() {
    const [total, enabled, disabled] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(feature_flags),
      db.select({ count: sql<number>`count(*)` }).from(feature_flags).where(eq(feature_flags.enabled, true)),
      db.select({ count: sql<number>`count(*)` }).from(feature_flags).where(eq(feature_flags.enabled, false)),
    ]);

    return {
      total: Number(total[0].count),
      enabled: Number(enabled[0].count),
      disabled: Number(disabled[0].count),
    };
  }

  async get_by_id(id: string) {
    const [row] = await db.select().from(feature_flags).where(eq(feature_flags.id, id)).limit(1);
    return row ?? null;
  }

  async get_by_key(key: string) {
    const [row] = await db.select().from(feature_flags).where(eq(feature_flags.key, key)).limit(1);
    return row ?? null;
  }

  async find_enabled_by_key(key: string) {
    const [row] = await db
      .select({ id: feature_flags.id, enabled: feature_flags.enabled })
      .from(feature_flags)
      .where(and(eq(feature_flags.key, key), eq(feature_flags.enabled, true)))
      .limit(1);
    return row ?? null;
  }

  async create(input: {
    key: string;
    name: { en: string; fr: string; ar: string };
    description?: { en: string; fr: string; ar: string } | null;
    enabled?: boolean;
  }) {
    const id = generate_id();
    await db.insert(feature_flags).values({
      id,
      key: input.key,
      name: input.name,
      description: input.description ?? { en: "", fr: "", ar: "" },
      enabled: input.enabled ?? false,
    });
    return id;
  }

  async update(
    id: string,
    patch: Partial<typeof feature_flags.$inferInsert>,
  ) {
    await db.update(feature_flags).set(patch).where(eq(feature_flags.id, id));
    return this.get_by_id(id);
  }

  async set_enabled(id: string, enabled: boolean) {
    await db.update(feature_flags).set({ enabled }).where(eq(feature_flags.id, id));
    return this.get_by_id(id);
  }

  async delete(id: string) {
    await db.delete(feature_flags).where(eq(feature_flags.id, id));
  }
}

export const feature_flag_repository = new FeatureFlagRepository();
