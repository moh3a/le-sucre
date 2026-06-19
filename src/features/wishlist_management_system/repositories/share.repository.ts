import "server-only";

import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlist_share_tokens } from "../db/schema";
import type { WishlistShareToken } from "../types";

export class WishlistShareRepository {
  async find_by_id(id: string): Promise<WishlistShareToken | null> {
    const [row] = await db
      .select()
      .from(wishlist_share_tokens)
      .where(eq(wishlist_share_tokens.id, id))
      .limit(1);
    return row ?? null;
  }

  async find_by_token(token: string): Promise<WishlistShareToken | null> {
    const [row] = await db
      .select()
      .from(wishlist_share_tokens)
      .where(eq(wishlist_share_tokens.token, token))
      .limit(1);
    return row ?? null;
  }

  async list_by_wishlist(wishlist_id: string): Promise<WishlistShareToken[]> {
    return db
      .select()
      .from(wishlist_share_tokens)
      .where(eq(wishlist_share_tokens.wishlist_id, wishlist_id))
      .orderBy(wishlist_share_tokens.created_at);
  }

  async create(data: typeof wishlist_share_tokens.$inferInsert): Promise<void> {
    await db.insert(wishlist_share_tokens).values(data);
  }

  async update(id: string, data: Partial<typeof wishlist_share_tokens.$inferInsert>): Promise<void> {
    await db.update(wishlist_share_tokens).set(data).where(eq(wishlist_share_tokens.id, id));
  }

  async increment_use_count(id: string): Promise<void> {
    await db
      .update(wishlist_share_tokens)
      .set({
        use_count: sql`${wishlist_share_tokens.use_count} + 1`,
      })
      .where(eq(wishlist_share_tokens.id, id));
  }

  async deactivate(id: string): Promise<void> {
    await db
      .update(wishlist_share_tokens)
      .set({ is_active: false })
      .where(eq(wishlist_share_tokens.id, id));
  }

  async deactivate_by_wishlist(wishlist_id: string): Promise<void> {
    await db
      .update(wishlist_share_tokens)
      .set({ is_active: false })
      .where(eq(wishlist_share_tokens.wishlist_id, wishlist_id));
  }

  async count_by_wishlist(wishlist_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(wishlist_share_tokens)
      .where(eq(wishlist_share_tokens.wishlist_id, wishlist_id));
    return Number(row.total);
  }
}

export const wishlist_share_repository = new WishlistShareRepository();
