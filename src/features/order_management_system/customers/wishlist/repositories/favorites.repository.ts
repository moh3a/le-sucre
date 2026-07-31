import "server-only";

import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { favorites } from "../db/schema";
import type { Favorite } from "../types";

export class FavoritesRepository {
  async find_by_id(id: string): Promise<Favorite | null> {
    const [row] = await db.select().from(favorites).where(eq(favorites.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_customer_and_product(
    customer_id: string,
    product_id: string,
  ): Promise<Favorite | null> {
    const [row] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.customer_id, customer_id),
          eq(favorites.product_id, product_id),
          isNull(favorites.brand_id),
          isNull(favorites.category_id),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async find_by_customer_and_brand(
    customer_id: string,
    brand_id: string,
  ): Promise<Favorite | null> {
    const [row] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.customer_id, customer_id),
          eq(favorites.brand_id, brand_id),
          isNull(favorites.product_id),
          isNull(favorites.category_id),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async find_by_customer_and_category(
    customer_id: string,
    category_id: string,
  ): Promise<Favorite | null> {
    const [row] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.customer_id, customer_id),
          eq(favorites.category_id, category_id),
          isNull(favorites.product_id),
          isNull(favorites.brand_id),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async list_by_customer(
    customer_id: string,
    page: number,
    limit: number,
    type?: "product" | "brand" | "category",
  ): Promise<{ items: Favorite[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof eq>[] = [eq(favorites.customer_id, customer_id)];

    if (type === "product") conditions.push(sql`${favorites.product_id} IS NOT NULL`);
    if (type === "brand") conditions.push(sql`${favorites.brand_id} IS NOT NULL`);
    if (type === "category") conditions.push(sql`${favorites.category_id} IS NOT NULL`);

    const where = and(...conditions);
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(favorites)
        .where(where)
        .orderBy(desc(favorites.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(favorites).where(where),
    ]);
    return { items, total: Number(total) };
  }

  async list_product_favorites(
    customer_id: string,
    page: number,
    limit: number,
  ): Promise<{ items: Favorite[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions = and(
      eq(favorites.customer_id, customer_id),
      sql`${favorites.product_id} IS NOT NULL`,
    );
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(favorites)
        .where(conditions)
        .orderBy(desc(favorites.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(favorites).where(conditions),
    ]);
    return { items, total: Number(total) };
  }

  async create(data: typeof favorites.$inferInsert): Promise<void> {
    await db.insert(favorites).values(data);
  }

  async delete(id: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  async count_by_product(product_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(favorites)
      .where(eq(favorites.product_id, product_id));
    return Number(row.total);
  }

  async count_by_brand(brand_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(favorites)
      .where(eq(favorites.brand_id, brand_id));
    return Number(row.total);
  }

  async count_by_category(category_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(favorites)
      .where(eq(favorites.category_id, category_id));
    return Number(row.total);
  }

  async get_top_favorited_products(limit = 10): Promise<Array<{ product_id: string; count: number }>> {
    const result = await db
      .select({
        product_id: favorites.product_id,
        count: count(),
      })
      .from(favorites)
      .where(sql`${favorites.product_id} IS NOT NULL`)
      .groupBy(favorites.product_id)
      .orderBy(desc(count()))
      .limit(limit);
    return result.map((r) => ({ product_id: r.product_id!, count: Number(r.count) }));
  }

  async get_top_favorited_brands(limit = 10): Promise<Array<{ brand_id: string; count: number }>> {
    const result = await db
      .select({
        brand_id: favorites.brand_id,
        count: count(),
      })
      .from(favorites)
      .where(sql`${favorites.brand_id} IS NOT NULL`)
      .groupBy(favorites.brand_id)
      .orderBy(desc(count()))
      .limit(limit);
    return result.map((r) => ({ brand_id: r.brand_id!, count: Number(r.count) }));
  }

  async get_top_favorited_categories(limit = 10): Promise<Array<{ category_id: string; count: number }>> {
    const result = await db
      .select({
        category_id: favorites.category_id,
        count: count(),
      })
      .from(favorites)
      .where(sql`${favorites.category_id} IS NOT NULL`)
      .groupBy(favorites.category_id)
      .orderBy(desc(count()))
      .limit(limit);
    return result.map((r) => ({ category_id: r.category_id!, count: Number(r.count) }));
  }

  async get_total_favorites(): Promise<number> {
    const [row] = await db.select({ total: count() }).from(favorites);
    return Number(row.total);
  }

  async get_customer_favorites_count(customer_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(favorites)
      .where(eq(favorites.customer_id, customer_id));
    return Number(row.total);
  }
}

export const favorites_repository = new FavoritesRepository();
