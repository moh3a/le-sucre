import "server-only";
import { and, asc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { analytics_jobs } from "../schema";
import { aggregation_service } from "./aggregation.service";
import { retention_service } from "./retention.service";
import { day_key } from "../engines/event-tracking.engine";

type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

const JOB_HANDLERS: Record<string, JobHandler> = {
  rollup_daily: (payload) =>
    aggregation_service.rollup_day(String(payload.day_key ?? day_key())),
  purge_raw: () => retention_service.purge_raw_events(),
  purge_old_aggregates: () => retention_service.purge_old_aggregates(),
  rebuild_cohorts: () => aggregation_service.rollup_cohorts(),
};

const JOB_SCHEDULE: Array<{ job_type: string; interval_days: number; day_key?: boolean }> = [
  { job_type: "rollup_daily", interval_days: 1, day_key: true },
  { job_type: "purge_raw", interval_days: 7 },
  { job_type: "purge_old_aggregates", interval_days: 7 },
  { job_type: "rebuild_cohorts", interval_days: 30 },
];

export class AggregationJobRunnerService {
  async run_due(limit = 10) {
    await this.ensure_job_schedule();

    const jobs = await db
      .select()
      .from(analytics_jobs)
      .where(and(eq(analytics_jobs.status, "pending"), lte(analytics_jobs.run_after, sql`NOW()`)))
      .orderBy(asc(analytics_jobs.run_after))
      .limit(limit);

    for (const job of jobs) {
      try {
        const handler = JOB_HANDLERS[job.job_type];
        if (!handler) {
          throw new Error(`Unknown analytics job type: ${job.job_type}`);
        }
        await handler((job.payload as Record<string, unknown>) ?? {});
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

  /** Enqueue each recurring job type once per its interval. */
  private async ensure_job_schedule() {
    for (const schedule of JOB_SCHEDULE) {
      const since = format(subDays(new Date(), schedule.interval_days), "yyyy-MM-dd");
      const existing = await db
        .select({ id: analytics_jobs.id })
        .from(analytics_jobs)
        .where(
          and(
            eq(analytics_jobs.job_type, schedule.job_type),
            gte(analytics_jobs.created_at, since),
            ne(analytics_jobs.status, "failed"),
          ),
        )
        .limit(1);

      if (existing.length) continue;

      const payload = schedule.day_key
        ? { day_key: format(subDays(new Date(), 1), "yyyy-MM-dd") }
        : {};
      await db.insert(analytics_jobs).values({
        id: generate_id(),
        job_type: schedule.job_type,
        payload,
        run_after: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });
    }
  }
}

export const aggregation_job_runner_service = new AggregationJobRunnerService();
