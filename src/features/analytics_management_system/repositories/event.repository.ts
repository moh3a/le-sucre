import "server-only";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { analytics_events } from "../schema";
import { day_key } from "../engines/event-tracking.engine";

export class EventRepository {
  async insert_batch(rows: Array<typeof analytics_events.$inferInsert>) {
    if (!rows.length) return;
    await db.insert(analytics_events).values(rows);
  }

  build_row(input: {
    event_type: string;
    session_key?: string | null;
    user_id?: string | null;
    product_id?: string | null;
    sku_id?: string | null;
    category_id?: string | null;
    brand_id?: string | null;
    order_id?: string | null;
    cart_id?: string | null;
    search_query?: string | null;
    campaign_id?: string | null;
    slot_type?: string | null;
    revenue?: string | null;
    quantity?: number | null;
    metadata?: Record<string, unknown>;
  }) {
    const now = new Date();
    return {
      id: generate_id(),
      ...input,
      day_key: day_key(now),
      occurred_at: now.toISOString(),
      metadata: input.metadata ?? {},
    };
  }

  async purge_older_than(day_cutoff: string) {
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`DELETE FROM analytics_events WHERE day_key < ${day_cutoff}`);
  }
}

export const event_repository = new EventRepository();
