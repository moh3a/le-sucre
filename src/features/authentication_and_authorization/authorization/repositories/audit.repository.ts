import "server-only";

import { and, count, desc, eq, like, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { audit_logs, users } from "@/features/authentication_and_authorization/auth/schema";

export type AuditLogInsert = {
  actor_user_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
};

export class AuditRepository {
  async insert(input: AuditLogInsert) {
    const [row] = await db.insert(audit_logs).values(input).$returningId();
    return row;
  }

  async list_by_user(user_id: string, page = 1, limit = 20) {
    const safe_limit = Math.min(Math.max(limit, 1), 100);
    const offset = (Math.max(page, 1) - 1) * safe_limit;

    const [items, total_row] = await Promise.all([
      db
        .select({
          id: audit_logs.id,
          action: audit_logs.action,
          resource_type: audit_logs.resource_type,
          resource_id: audit_logs.resource_id,
          metadata: audit_logs.metadata,
          ip_address: audit_logs.ip_address,
          user_agent: audit_logs.user_agent,
          created_at: audit_logs.created_at,
        })
        .from(audit_logs)
        .where(eq(audit_logs.actor_user_id, user_id))
        .orderBy(desc(audit_logs.created_at))
        .limit(safe_limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(audit_logs)
        .where(eq(audit_logs.actor_user_id, user_id)),
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

  async list_paginated(page = 1, limit = 20, search?: string) {
    const safe_limit = Math.min(Math.max(limit, 1), 100);
    const offset = (Math.max(page, 1) - 1) * safe_limit;

    const conditions = [];
    if (search) {
      conditions.push(
        like(audit_logs.action, `%${search}%`),
      );
    }

    const where_clause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, total_row] = await Promise.all([
      db
        .select({
          id: audit_logs.id,
          action: audit_logs.action,
          resource_type: audit_logs.resource_type,
          resource_id: audit_logs.resource_id,
          metadata: audit_logs.metadata,
          ip_address: audit_logs.ip_address,
          user_agent: audit_logs.user_agent,
          created_at: audit_logs.created_at,
          actor_email: users.email,
          actor_name: users.name,
        })
        .from(audit_logs)
        .leftJoin(users, eq(audit_logs.actor_user_id, users.id))
        .where(where_clause)
        .orderBy(desc(audit_logs.created_at))
        .limit(safe_limit)
        .offset(offset),
      db.select({ total: count() }).from(audit_logs).where(where_clause),
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

  async stats(): Promise<{
    total: number;
    today: number;
    unique_users: number;
    unique_actions: number;
  }> {
    const now = new Date();
    const today_start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} 00:00:00`;

    const [total_result, today_result, users_result, actions_result] = await Promise.all([
      db.select({ count: count() }).from(audit_logs),
      db.select({ count: count() }).from(audit_logs).where(sql`${audit_logs.created_at} >= ${today_start}`),
      db.select({ count: sql<number>`COUNT(DISTINCT ${audit_logs.actor_user_id})` }).from(audit_logs),
      db.select({ count: sql<number>`COUNT(DISTINCT ${audit_logs.action})` }).from(audit_logs),
    ]);

    return {
      total: Number(total_result[0]?.count ?? 0),
      today: Number(today_result[0]?.count ?? 0),
      unique_users: Number(users_result[0]?.count ?? 0),
      unique_actions: Number(actions_result[0]?.count ?? 0),
    };
  }
}

export const audit_repository = new AuditRepository();
