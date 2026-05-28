import "server-only";

import { and, asc, desc, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/features/order_management_system/orders/schema";
import { shipments, shipment_tracking_events, shipping_jobs } from "./schema";

export class ShippingRepository {
  async get_order(order_id: string) {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.id, order_id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_shipment_by_order(order_id: string) {
    return await db
      .select()
      .from(shipments)
      .where(eq(shipments.order_id, order_id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async find_shipment(id: string) {
    return await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async list_shipments(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    return await db
      .select()
      .from(shipments)
      .where(status ? eq(shipments.status, status) : undefined)
      .orderBy(desc(shipments.created_at))
      .limit(limit)
      .offset(offset);
  }

  async create_shipment(input: typeof shipments.$inferInsert) {
    const [id] = await db.insert(shipments).values(input).$returningId();
    return this.find_shipment(id.id);
  }

  async update_shipment(id: string, patch: Partial<typeof shipments.$inferInsert>) {
    return await db.update(shipments).set(patch).where(eq(shipments.id, id));
  }

  async insert_tracking_events(rows: Array<typeof shipment_tracking_events.$inferInsert>) {
    if (!rows.length) return Promise.resolve();
    return await db
      .insert(shipment_tracking_events)
      .values(rows)
      .onDuplicateKeyUpdate({
        set: { description: rows[0].description },
      });
  }

  async get_tracking_events(shipment_id: string) {
    return await db
      .select()
      .from(shipment_tracking_events)
      .where(eq(shipment_tracking_events.shipment_id, shipment_id))
      .orderBy(desc(shipment_tracking_events.occurred_at));
  }

  async create_job(input: typeof shipping_jobs.$inferInsert) {
    return await db.insert(shipping_jobs).values(input);
  }

  async claim_due_jobs(now_iso: string, limit = 20) {
    const due = await db
      .select()
      .from(shipping_jobs)
      .where(and(eq(shipping_jobs.status, "pending"), lte(shipping_jobs.run_at, now_iso)))
      .orderBy(asc(shipping_jobs.run_at))
      .limit(limit);

    for (const j of due) {
      await db
        .update(shipping_jobs)
        .set({ status: "processing", attempts: j.attempts + 1 })
        .where(and(eq(shipping_jobs.id, j.id), eq(shipping_jobs.status, "pending")));
    }

    return await db
      .select()
      .from(shipping_jobs)
      .where(eq(shipping_jobs.status, "processing"))
      .limit(limit);
  }

  async finish_job(id: string) {
    return await db.update(shipping_jobs).set({ status: "done" }).where(eq(shipping_jobs.id, id));
  }

  async retry_job(id: string, run_at: string, last_error: string) {
    return await db
      .update(shipping_jobs)
      .set({ status: "pending", run_at, last_error })
      .where(eq(shipping_jobs.id, id));
  }

  async fail_job(id: string, last_error: string) {
    return await db
      .update(shipping_jobs)
      .set({ status: "failed", last_error })
      .where(eq(shipping_jobs.id, id));
  }
}

export const shipping_repository = new ShippingRepository();
