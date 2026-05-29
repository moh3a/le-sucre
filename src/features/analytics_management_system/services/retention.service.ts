import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ANALYTICS_RETENTION } from "../constants/retention";
import { event_repository } from "../repositories/event.repository";

export class RetentionService {
  async purge_raw_events() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ANALYTICS_RETENTION.raw_events_days);
    await event_repository.purge_older_than(cutoff.toISOString().slice(0, 10));
  }

  async purge_old_aggregates() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ANALYTICS_RETENTION.aggregate_days);
    const day = cutoff.toISOString().slice(0, 10);
    await db.execute(sql`DELETE FROM analytics_product_daily WHERE day_key < ${day}`);
    await db.execute(sql`DELETE FROM analytics_daily_metrics WHERE day_key < ${day}`);
  }
}

export const retention_service = new RetentionService();
