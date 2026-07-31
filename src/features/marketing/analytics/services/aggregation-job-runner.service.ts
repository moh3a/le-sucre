import "server-only";
import { and, asc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { analytics_jobs } from "../schema";
import { aggregation_service } from "./aggregation.service";
import { retention_service } from "./retention.service";
import { day_key } from "../engines/event-tracking.engine";

export class AggregationJobRunnerService {
  async run_due(limit = 10) {
    await this.ensure_daily_rollup_job();

    const jobs = await db
      .select()
      .from(analytics_jobs)
      .where(and(eq(analytics_jobs.status, "pending"), lte(analytics_jobs.run_after, sql`NOW()`)))
      .orderBy(asc(analytics_jobs.run_after))
      .limit(limit);

    for (const job of jobs) {
      try {
        if (job.job_type === "rollup_daily") {
          const day = String(job.payload?.day_key ?? day_key());
          await aggregation_service.rollup_day(day);
        } else if (job.job_type === "purge_raw") {
          await retention_service.purge_raw_events();
        }
        await db
          .update(analytics_jobs)
          .set({ status: "done" })
          .where(eq(analytics_jobs.id, job.id));
      } catch (e) {
        await db
          .update(analytics_jobs)
          .set({
            status: "failed",
            attempts: job.attempts + 1,
            last_error: e instanceof Error ? e.message : "unknown",
          })
          .where(eq(analytics_jobs.id, job.id));
      }
    }
  }

  private async ensure_daily_rollup_job() {
    const today = format(new Date(), "yyyy-MM-dd");
    const existing = await db
      .select({ id: analytics_jobs.id })
      .from(analytics_jobs)
      .where(
        and(
          eq(analytics_jobs.job_type, "rollup_daily"),
          gte(analytics_jobs.created_at, today),
          ne(analytics_jobs.status, "failed"),
        ),
      )
      .limit(1);

    if (existing.length) return;

    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    await db.insert(analytics_jobs).values({
      id: generate_id(),
      job_type: "rollup_daily",
      payload: { day_key: yesterday },
      run_after: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  }
}

export const aggregation_job_runner_service = new AggregationJobRunnerService();
