import "server-only";
import { db } from "@/lib/db";
import { and, count, desc, eq } from "drizzle-orm";
import {
  order_assignments,
  order_escalations,
  order_holds,
  order_cancellation_requests,
  order_comments,
} from "../schema";

export class OrderOperationsRepository {
  async insert_assignment(input: typeof order_assignments.$inferInsert) {
    await db.insert(order_assignments).values(input);
  }

  async get_assignment_history(order_id: string, assignment_type?: string) {
    const where = assignment_type
      ? and(eq(order_assignments.order_id, order_id), eq(order_assignments.assignment_type, assignment_type))
      : eq(order_assignments.order_id, order_id);
    return db
      .select()
      .from(order_assignments)
      .where(where)
      .orderBy(desc(order_assignments.created_at));
  }

  async insert_escalation(input: typeof order_escalations.$inferInsert) {
    const [created] = await db.insert(order_escalations).values(input).$returningId();
    return created.id;
  }

  async update_escalation(id: string, patch: Partial<typeof order_escalations.$inferInsert>) {
    await db.update(order_escalations).set(patch).where(eq(order_escalations.id, id));
  }

  async get_escalation(id: string) {
    return db
      .select()
      .from(order_escalations)
      .where(eq(order_escalations.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async get_escalations_by_order(order_id: string) {
    return db
      .select()
      .from(order_escalations)
      .where(eq(order_escalations.order_id, order_id))
      .orderBy(desc(order_escalations.created_at));
  }

  async list_escalations(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(order_escalations.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(order_escalations)
        .where(where)
        .orderBy(desc(order_escalations.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(order_escalations).where(where),
    ]);
    const total_records = Number(total ?? 0);
    return {
      items,
      meta: { page, limit, total_records, total_pages: Math.max(1, Math.ceil(total_records / limit)), has_more: page * limit < total_records },
    };
  }

  async insert_hold(input: typeof order_holds.$inferInsert) {
    const [created] = await db.insert(order_holds).values(input).$returningId();
    return created.id;
  }

  async release_hold(id: string, patch: Partial<typeof order_holds.$inferInsert>) {
    await db.update(order_holds).set(patch).where(eq(order_holds.id, id));
  }

  async get_active_hold(order_id: string) {
    return db
      .select()
      .from(order_holds)
      .where(and(eq(order_holds.order_id, order_id), eq(order_holds.is_active, true)))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async get_holds_by_order(order_id: string) {
    return db
      .select()
      .from(order_holds)
      .where(eq(order_holds.order_id, order_id))
      .orderBy(desc(order_holds.created_at));
  }

  async insert_cancellation_request(input: typeof order_cancellation_requests.$inferInsert) {
    const [created] = await db.insert(order_cancellation_requests).values(input).$returningId();
    return created.id;
  }

  async update_cancellation_request(id: string, patch: Partial<typeof order_cancellation_requests.$inferInsert>) {
    await db.update(order_cancellation_requests).set(patch).where(eq(order_cancellation_requests.id, id));
  }

  async get_cancellation_request(id: string) {
    return db
      .select()
      .from(order_cancellation_requests)
      .where(eq(order_cancellation_requests.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async get_pending_cancellation(order_id: string) {
    return db
      .select()
      .from(order_cancellation_requests)
      .where(and(eq(order_cancellation_requests.order_id, order_id), eq(order_cancellation_requests.status, "pending")))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async get_cancellation_requests_by_order(order_id: string) {
    return db
      .select()
      .from(order_cancellation_requests)
      .where(eq(order_cancellation_requests.order_id, order_id))
      .orderBy(desc(order_cancellation_requests.created_at));
  }

  async list_cancellation_requests(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(order_cancellation_requests.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(order_cancellation_requests)
        .where(where)
        .orderBy(desc(order_cancellation_requests.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(order_cancellation_requests).where(where),
    ]);
    const total_records = Number(total ?? 0);
    return {
      items,
      meta: { page, limit, total_records, total_pages: Math.max(1, Math.ceil(total_records / limit)), has_more: page * limit < total_records },
    };
  }

  async insert_comment(input: typeof order_comments.$inferInsert) {
    const [created] = await db.insert(order_comments).values(input).$returningId();
    return created.id;
  }

  async get_comments(order_id: string, include_private = true) {
    const where = include_private
      ? eq(order_comments.order_id, order_id)
      : and(eq(order_comments.order_id, order_id), eq(order_comments.is_private, false));
    return db
      .select()
      .from(order_comments)
      .where(where)
      .orderBy(desc(order_comments.created_at));
  }

  async update_comment(id: string, content: string) {
    await db.update(order_comments).set({ content }).where(eq(order_comments.id, id));
  }
}

export const order_operations_repository = new OrderOperationsRepository();
