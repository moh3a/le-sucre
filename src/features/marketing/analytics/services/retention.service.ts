import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ANALYTICS_RETENTION } from "../constants/retention";
import { event_repository } from "../repositories/event.repository";
import { format, subDays } from "date-fns";

const AGGREGATE_TABLES = [
  "analytics_daily_metrics",
  "analytics_product_daily",
  "analytics_category_daily",
  "analytics_brand_daily",
  "analytics_search_daily",
  "analytics_funnel_daily",
];

export class RetentionService {
  async purge_raw_events() {
    await event_repository.purge_older_than(
      format(subDays(new Date(), ANALYTICS_RETENTION.raw_events_days), "yyyy-MM-dd"),
    );
  }

  async purge_old_aggregates() {
    const day = format(subDays(new Date(), ANALYTICS_RETENTION.aggregate_days), "yyyy-MM-dd");
    for (const table of AGGREGATE_TABLES) {
      await db.execute(sql`DELETE FROM ${sql.raw(table)} WHERE day_key < ${day}`);
    }
  }
}

export const retention_service = new RetentionService();
