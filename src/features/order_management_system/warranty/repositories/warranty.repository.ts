import "server-only";
import { db } from "@/lib/db";
import { count, desc, eq } from "drizzle-orm";
import { warranty_requests } from "../schema";

export class WarrantyRepository {
  async create(input: typeof warranty_requests.$inferInsert) {
    const [created] = await db.insert(warranty_requests).values(input).$returningId();
    return created.id;
  }

  async update(id: string, patch: Partial<typeof warranty_requests.$inferInsert>) {
    await db.update(warranty_requests).set(patch).where(eq(warranty_requests.id, id));
  }

  async find_by_id(id: string) {
    return db.select().from(warranty_requests).where(eq(warranty_requests.id, id)).limit(1).then((r) => r[0] ?? null);
  }

  async find_by_order(order_id: string) {
    return db.select().from(warranty_requests).where(eq(warranty_requests.order_id, order_id)).orderBy(desc(warranty_requests.created_at));
  }

  async list(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(warranty_requests.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(warranty_requests).where(where).orderBy(desc(warranty_requests.created_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(warranty_requests).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async stats() {
    const [pending] = await db.select({ count: count() }).from(warranty_requests).where(eq(warranty_requests.status, "pending"));
    const [under_review] = await db.select({ count: count() }).from(warranty_requests).where(eq(warranty_requests.status, "under_review"));
    return { pending: Number(pending?.count ?? 0), under_review: Number(under_review?.count ?? 0) };
  }
}

export const warranty_repository = new WarrantyRepository();
