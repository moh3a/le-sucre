import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, user_roles, roles } from "@/features/authentication_and_authorization/auth/schema";
import { format, subDays } from "date-fns";

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

  async list_paginated(page: number = 1, limit: number = 20) {
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
          banned: users.banned,
          ban_reason: users.ban_reason,
          ban_expires: users.ban_expires,
          created_at: users.created_at,
          roles:
            sql<string>`GROUP_CONCAT(DISTINCT ${roles.name} ORDER BY ${roles.name} SEPARATOR ', ')`.as(
              "roles",
            ),
        })
        .from(users)
        .leftJoin(user_roles, eq(user_roles.user_id, users.id))
        .leftJoin(roles, eq(user_roles.role_id, roles.id))
        .groupBy(
          users.id,
          users.name,
          users.email,
          users.email_verified,
          users.is_active,
          users.banned,
          users.ban_reason,
          users.ban_expires,
          users.created_at,
        )
        .orderBy(desc(users.created_at))
        .limit(safe_limit)
        .offset(offset),
      db.select({ total: count() }).from(users),
    ]);

    const total_records = Number(total_row[0]?.total ?? 0);
    const total_pages = Math.ceil(total_records / safe_limit) || 1;

    return {
      items: items.map((item) => ({
        ...item,
        role: item.roles?.split(", ")[0] ?? "—",
        phone: "—",
      })),
      meta: {
        page,
        limit: safe_limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }

  // async list_paginated(page = 1, limit = 20) {
  //   const safe_limit = Math.min(Math.max(limit, 1), 100);
  //   const offset = (Math.max(page, 1) - 1) * safe_limit;

  //   const [items, total_row] = await Promise.all([
  //     db
  //       .select({
  //         id: users.id,
  //         name: users.name,
  //         email: users.email,
  //         email_verified: users.email_verified,
  //         is_active: users.is_active,
  //         created_at: users.created_at,
  //       })
  //       .from(users)
  //       .orderBy(desc(users.created_at))
  //       .limit(safe_limit)
  //       .offset(offset),
  //     db.select({ total: count() }).from(users),
  //   ]);

  //   const total_records = Number(total_row[0]?.total ?? 0);
  //   const total_pages = Math.ceil(total_records / safe_limit) || 1;

  //   return {
  //     items,
  //     meta: {
  //       page,
  //       limit: safe_limit,
  //       total_records,
  //       total_pages,
  //       has_more: page < total_pages,
  //     },
  //   };
  // }

  async update_profile(
    id: string,
    patch: {
      name?: string;
      image?: string | null;
      is_active?: boolean;
      banned?: boolean | null;
      ban_reason?: string | null;
      ban_expires?: Date | null;
    },
  ) {
    const clean_patch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(clean_patch).length === 0) return;
    await db.update(users).set(clean_patch).where(eq(users.id, id));
  }

  async stats() {
    const since_30d = format(subDays(new Date(), 30), "yyyy-MM-dd");

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

  async find_users_by_role(role_name: string) {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .innerJoin(user_roles, eq(user_roles.user_id, users.id))
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(roles.name, role_name))
      .orderBy(users.name);
  }
}

export const user_repository = new UserRepository();
