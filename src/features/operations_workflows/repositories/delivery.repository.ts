import "server-only";
import { db } from "@/lib/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { delivery_attempts } from "../schema";

export class DeliveryRepository {
  async insert_attempt(input: typeof delivery_attempts.$inferInsert) {
    const [created] = await db.insert(delivery_attempts).values(input).$returningId();
    return created.id;
  }

  async get_attempts_by_shipment(shipment_id: string) {
    return db
      .select()
      .from(delivery_attempts)
      .where(eq(delivery_attempts.shipment_id, shipment_id))
      .orderBy(desc(delivery_attempts.attempt_number));
  }

  async get_attempts_by_order(order_id: string) {
    return db
      .select()
      .from(delivery_attempts)
      .where(eq(delivery_attempts.order_id, order_id))
      .orderBy(desc(delivery_attempts.attempted_at));
  }

  async get_latest_attempt(shipment_id: string) {
    return db
      .select()
      .from(delivery_attempts)
      .where(eq(delivery_attempts.shipment_id, shipment_id))
      .orderBy(desc(delivery_attempts.attempt_number))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async count_failed_deliveries(since?: string) {
    const where = since
      ? and(eq(delivery_attempts.status, "failed"), sql`${delivery_attempts.attempted_at} >= ${since}`)
      : eq(delivery_attempts.status, "failed");
    const [{ count: total }] = await db.select({ count: count() }).from(delivery_attempts).where(where);
    return Number(total ?? 0);
  }

  async list_attempts(page = 1, limit = 20, status?: string, delivery_person_id?: string) {
    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(delivery_attempts.status, status));
    if (delivery_person_id) conditions.push(eq(delivery_attempts.delivery_person_id, delivery_person_id));
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db.select().from(delivery_attempts).where(where).orderBy(desc(delivery_attempts.attempted_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(delivery_attempts).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_stats() {
    const [[{ failed }], [{ successful }], [{ pending }], [{ rto }], [{ today_failed }]] = await Promise.all([
      db.select({ failed: count() }).from(delivery_attempts).where(eq(delivery_attempts.status, "failed")),
      db.select({ successful: count() }).from(delivery_attempts).where(eq(delivery_attempts.status, "successful")),
      db.select({ pending: count() }).from(delivery_attempts).where(sql`${delivery_attempts.next_attempt_at} IS NOT NULL AND ${delivery_attempts.next_attempt_at} >= NOW()`),
      db.select({ rto: count() }).from(delivery_attempts).where(eq(delivery_attempts.status, "cancelled")),
      db.select({ today_failed: count() }).from(delivery_attempts).where(
        and(
          eq(delivery_attempts.status, "failed"),
          sql`DATE(${delivery_attempts.attempted_at}) = CURDATE()`,
        ),
      ),
    ]);
    return {
      total_failed: Number(failed ?? 0),
      total_successful: Number(successful ?? 0),
      pending_retries: Number(pending ?? 0),
      total_rto: Number(rto ?? 0),
      today_failed: Number(today_failed ?? 0),
    };
  }
}

export const delivery_repository = new DeliveryRepository();
