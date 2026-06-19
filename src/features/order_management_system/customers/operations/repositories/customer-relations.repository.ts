import "server-only";
import { db } from "@/lib/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import {
  customer_contacts,
  customer_notes,
  customer_follow_ups,
  customer_support_cases,
  customer_support_messages,
} from "../schema";

export class CustomerRelationsRepository {
  async insert_contact(input: typeof customer_contacts.$inferInsert) {
    const [created] = await db.insert(customer_contacts).values(input).$returningId();
    return created.id;
  }

  async get_contacts_by_user(user_id: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(customer_contacts).where(eq(customer_contacts.user_id, user_id)).orderBy(desc(customer_contacts.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(customer_contacts).where(eq(customer_contacts.user_id, user_id)),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_contacts_by_order(order_id: string) {
    return db.select().from(customer_contacts).where(eq(customer_contacts.order_id, order_id)).orderBy(desc(customer_contacts.created_at));
  }

  async insert_note(input: typeof customer_notes.$inferInsert) {
    const [created] = await db.insert(customer_notes).values(input).$returningId();
    return created.id;
  }

  async get_notes_by_user(user_id: string, note_type?: string) {
    const where = note_type ? and(eq(customer_notes.user_id, user_id), eq(customer_notes.note_type, note_type)) : eq(customer_notes.user_id, user_id);
    return db.select().from(customer_notes).where(where).orderBy(desc(customer_notes.created_at));
  }

  async toggle_pin_note(note_id: string, is_pinned: boolean) {
    await db.update(customer_notes).set({ is_pinned }).where(eq(customer_notes.id, note_id));
  }

  async insert_follow_up(input: typeof customer_follow_ups.$inferInsert) {
    const [created] = await db.insert(customer_follow_ups).values(input).$returningId();
    return created.id;
  }

  async update_follow_up(id: string, patch: Partial<typeof customer_follow_ups.$inferInsert>) {
    await db.update(customer_follow_ups).set(patch).where(eq(customer_follow_ups.id, id));
  }

  async get_follow_up(id: string) {
    return db.select().from(customer_follow_ups).where(eq(customer_follow_ups.id, id)).limit(1).then((r) => r[0] ?? null);
  }

  async list_follow_ups(assigned_to_user_id: string, status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const where = status ? and(eq(customer_follow_ups.assigned_to_user_id, assigned_to_user_id), eq(customer_follow_ups.status, status)) : eq(customer_follow_ups.assigned_to_user_id, assigned_to_user_id);
    const [items, [{ total }]] = await Promise.all([
      db.select().from(customer_follow_ups).where(where).orderBy(desc(customer_follow_ups.scheduled_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(customer_follow_ups).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_follow_ups_by_user(user_id: string) {
    return db.select().from(customer_follow_ups).where(eq(customer_follow_ups.user_id, user_id)).orderBy(desc(customer_follow_ups.scheduled_at));
  }

  async get_overdue_follow_ups() {
    return db.select().from(customer_follow_ups).where(and(eq(customer_follow_ups.status, "pending"), sql`${customer_follow_ups.scheduled_at} < NOW()`)).orderBy(desc(customer_follow_ups.scheduled_at));
  }

  async insert_case(input: typeof customer_support_cases.$inferInsert) {
    const [created] = await db.insert(customer_support_cases).values(input).$returningId();
    return created.id;
  }

  async update_case(id: string, patch: Partial<typeof customer_support_cases.$inferInsert>) {
    await db.update(customer_support_cases).set(patch).where(eq(customer_support_cases.id, id));
  }

  async get_case(id: string) {
    return db.select().from(customer_support_cases).where(eq(customer_support_cases.id, id)).limit(1).then((r) => r[0] ?? null);
  }

  async get_cases_by_user(user_id: string) {
    return db.select().from(customer_support_cases).where(eq(customer_support_cases.user_id, user_id)).orderBy(desc(customer_support_cases.created_at));
  }

  async list_cases(page = 1, limit = 20, status?: string, assigned_to?: string) {
    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(customer_support_cases.status, status));
    if (assigned_to) conditions.push(eq(customer_support_cases.assigned_to_user_id, assigned_to));
    const where = conditions.length ? and(...conditions) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(customer_support_cases).where(where).orderBy(desc(customer_support_cases.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(customer_support_cases).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async insert_message(input: typeof customer_support_messages.$inferInsert) {
    const [created] = await db.insert(customer_support_messages).values(input).$returningId();
    return created.id;
  }

  async get_messages(case_id: string) {
    return db.select().from(customer_support_messages).where(eq(customer_support_messages.case_id, case_id)).orderBy(customer_support_messages.created_at);
  }
}

export const customer_relations_repository = new CustomerRelationsRepository();
