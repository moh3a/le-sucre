import "server-only";
import { db } from "@/lib/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { notifications } from "../schema";

export class NotificationRepository {
  async create(input: typeof notifications.$inferInsert) {
    const [created] = await db.insert(notifications).values(input).$returningId();
    return created.id;
  }

  async mark_as_read(id: string, user_id: string) {
    await db
      .update(notifications)
      .set({ is_read: true, read_at: sql`NOW()` })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, user_id)));
  }

  async mark_all_as_read(user_id: string) {
    await db
      .update(notifications)
      .set({ is_read: true, read_at: sql`NOW()` })
      .where(and(eq(notifications.user_id, user_id), eq(notifications.is_read, false)));
  }

  async list(user_id: string, page = 1, limit = 20, unread_only = false) {
    const offset = (page - 1) * limit;
    const where = unread_only
      ? and(eq(notifications.user_id, user_id), eq(notifications.is_read, false))
      : eq(notifications.user_id, user_id);
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(where)
        .orderBy(desc(notifications.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(notifications).where(where),
    ]);
    const total_records = Number(total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / limit)),
        has_more: page * limit < total_records,
      },
    };
  }

  async count_unread(user_id: string) {
    const [{ count: unread }] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.user_id, user_id), eq(notifications.is_read, false)));
    return Number(unread ?? 0);
  }

  async get_by_reference(type: string, reference_type: string, reference_id: string) {
    return db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.type, type),
          eq(notifications.reference_type, reference_type),
          eq(notifications.reference_id, reference_id),
        ),
      )
      .limit(1)
      .then((r) => r[0] ?? null);
  }
}

export const notification_repository = new NotificationRepository();
