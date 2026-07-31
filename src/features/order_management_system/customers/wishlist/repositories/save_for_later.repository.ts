import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { save_for_later } from "../db/schema";
import type { SaveForLater } from "../types";

export class SaveForLaterRepository {
  async find_by_id(id: string): Promise<SaveForLater | null> {
    const [row] = await db.select().from(save_for_later).where(eq(save_for_later.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_customer_and_product(
    customer_id: string,
    product_id: string,
    variant_id: string | null,
  ): Promise<SaveForLater | null> {
    const conditions = variant_id
      ? and(
          eq(save_for_later.customer_id, customer_id),
          eq(save_for_later.product_id, product_id),
          eq(save_for_later.variant_id, variant_id),
        )
      : and(
          eq(save_for_later.customer_id, customer_id),
          eq(save_for_later.product_id, product_id),
          sql`${save_for_later.variant_id} IS NULL`,
        );
    const [row] = await db.select().from(save_for_later).where(conditions).limit(1);
    return row ?? null;
  }

  async list_by_customer(
    customer_id: string,
    page: number,
    limit: number,
  ): Promise<{ items: SaveForLater[]; total: number }> {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(save_for_later)
        .where(eq(save_for_later.customer_id, customer_id))
        .orderBy(desc(save_for_later.saved_date))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(save_for_later)
        .where(eq(save_for_later.customer_id, customer_id)),
    ]);
    return { items, total: Number(total) };
  }

  async list_by_customer_all(customer_id: string): Promise<SaveForLater[]> {
    return db
      .select()
      .from(save_for_later)
      .where(eq(save_for_later.customer_id, customer_id))
      .orderBy(desc(save_for_later.saved_date));
  }

  async create(data: typeof save_for_later.$inferInsert): Promise<void> {
    await db.insert(save_for_later).values(data);
  }

  async update(id: string, data: Partial<typeof save_for_later.$inferInsert>): Promise<void> {
    await db.update(save_for_later).set(data).where(eq(save_for_later.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(save_for_later).where(eq(save_for_later.id, id));
  }

  async delete_by_customer_and_product(
    customer_id: string,
    product_id: string,
    variant_id: string | null,
  ): Promise<void> {
    const conditions = variant_id
      ? and(
          eq(save_for_later.customer_id, customer_id),
          eq(save_for_later.product_id, product_id),
          eq(save_for_later.variant_id, variant_id),
        )
      : and(
          eq(save_for_later.customer_id, customer_id),
          eq(save_for_later.product_id, product_id),
          sql`${save_for_later.variant_id} IS NULL`,
        );
    await db.delete(save_for_later).where(conditions);
  }

  async count_by_customer(customer_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(save_for_later)
      .where(eq(save_for_later.customer_id, customer_id));
    return Number(row.total);
  }
}

export const save_for_later_repository = new SaveForLaterRepository();
