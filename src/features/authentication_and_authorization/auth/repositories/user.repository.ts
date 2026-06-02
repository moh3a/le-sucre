import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

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

  async stats() {
    const since_30d = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const [row] = await db
      .select({
        total: count(),
        active:
          sql<number>`SUM(CASE WHEN ${users.is_active} = 1 AND ${users.banned} IS NULL THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        new_30d:
          sql<number>`SUM(CASE WHEN DATE(${users.created_at}) >= ${since_30d} THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        staff:
          sql<number>`SUM(CASE WHEN ${users.role} IS NOT NULL AND ${users.role} != '' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(users);

    return {
      total: Number(row?.total ?? 0),
      active: row?.active ?? 0,
      new_30d: row?.new_30d ?? 0,
      staff: row?.staff ?? 0,
    };
  }
}

export const user_repository = new UserRepository();
