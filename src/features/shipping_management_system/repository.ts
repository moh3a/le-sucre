import "server-only";

import { and, asc, count, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/features/order_management_system/orders/schema";
import { shipments, shipment_tracking_events, shipping_jobs } from "./schema";

export class ShippingRepository {
  async admin_list_enriched(page: number, limit: number, status?: string) {
    const safe_limit = Math.min(Math.max(limit, 1), 100);
    const offset = (Math.max(page, 1) - 1) * safe_limit;
    const where = status ? eq(shipments.status, status) : undefined;
    const [items, total_row] = await Promise.all([
      db
        .select({
          id: shipments.id,
          order_id: shipments.order_id,
          order_number: orders.order_number,
          provider: shipments.provider,
          tracking_number: shipments.tracking_number,
          tracking_url: shipments.tracking_url,
          status: shipments.status,
          delivery_status: shipments.delivery_status,
          recipient_name: shipments.recipient_name,
          recipient_phone: shipments.recipient_phone,
          city: shipments.city,
          country_code: shipments.country_code,
          shipping_cost: shipments.shipping_cost,
          currency: shipments.currency,
          last_sync_at: shipments.last_sync_at,
          created_at: shipments.created_at,
        })
        .from(shipments)
        .innerJoin(orders, eq(shipments.order_id, orders.id))
        .where(where)
        .orderBy(desc(shipments.created_at))
        .limit(safe_limit)
        .offset(offset),
      db.select({ total: count() }).from(shipments).where(where),
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
  async admin_stats() {
    const rows = await db
      .select({
        status: shipments.status,
        count: count(),
      })
      .from(shipments)
      .groupBy(shipments.status);
    const map = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
    const [pending_sync_row] = await db
      .select({ count: count() })
      .from(shipments)
      .where(
        sql`${shipments.tracking_number} IS NOT NULL AND (${shipments.last_sync_at} IS NULL OR ${shipments.last_sync_at} < DATE_SUB(NOW(), INTERVAL 6 HOUR))`,
      );
    return {
      total: Object.values(map).reduce((a, b) => a + b, 0),
      draft: map.draft ?? 0,
      dispatched: map.dispatched ?? 0,
      in_transit: map.in_transit ?? 0,
      delivered: map.delivered ?? 0,
      failed: map.failed ?? 0,
      pending_sync: Number(pending_sync_row?.count ?? 0),
    };
  }

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
