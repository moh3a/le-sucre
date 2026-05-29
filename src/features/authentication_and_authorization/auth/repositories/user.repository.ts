import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/features/authentication_and_authorization/auth/schema";

export class UserRepository {
  async find_by_id(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async find_by_email(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async set_active(id: string, is_active: boolean) {
    await db.update(users).set({ is_active }).where(eq(users.id, id));
  }

  async list_paginated(page = 1, limit = 20) {
    const safe_limit = Math.min(Math.max(limit, 1), 100);
    const offset = (Math.max(page, 1) - 1) * safe_limit;

    const [items, total_row] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          email_verified: users.email_verified,
          is_active: users.is_active,
          created_at: users.created_at,
        })
        .from(users)
        .orderBy(desc(users.created_at))
        .limit(safe_limit)
        .offset(offset),
      db.select({ total: count() }).from(users),
    ]);

    const total_records = Number(total_row[0]?.total ?? 0);
    const total_pages = Math.ceil(total_records / safe_limit) || 1;

    return {
      items,
      meta: {
        page,
        limit: safe_limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }
}

export const user_repository = new UserRepository();
