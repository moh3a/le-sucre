import "server-only";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { format, addMinutes } from "date-fns";
import { and, desc, eq, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { campaign_jobs, campaigns } from "../schema";
import { CAMPAIGN_JOB_TYPE } from "../constants/campaign_types";

function to_db_ts(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
}

export class CampaignSchedulerRepository {
  async enqueue(
    job_type: string,
    campaign_id: string | null,
    payload: Record<string, unknown>,
    run_after: Date | string,
  ) {
    const id = generate_id();
    await db.insert(campaign_jobs).values({
      id,
      job_type,
      campaign_id: campaign_id ?? undefined,
      payload,
      status: "pending",
      run_after: to_db_ts(run_after),
      attempts: 0,
    });
    return id;
  }

  async poll_due(limit = 20) {
    const now = to_db_ts(new Date());
    return db
      .select()
      .from(campaign_jobs)
      .where(and(inArray(campaign_jobs.status, ["pending"]), lte(campaign_jobs.run_after, now)))
      .limit(limit);
  }

  async mark_processing(id: string) {
    await db
      .update(campaign_jobs)
      .set({ status: "processing", attempts: 0 })
      .where(eq(campaign_jobs.id, id));
  }

  async mark_done(id: string) {
    await db.update(campaign_jobs).set({ status: "done" }).where(eq(campaign_jobs.id, id));
  }

  async mark_failed(id: string, error: string, retry_delay_ms = 60_000) {
    const run_after = to_db_ts(addMinutes(new Date(), retry_delay_ms / 60_000));
    await db
      .update(campaign_jobs)
      .set({
        status: "pending",
        last_error: error.slice(0, 999),
        run_after,
      })
      .where(and(eq(campaign_jobs.id, id)));
    // If already failed 3 times, move to failed state
    const [row] = await db.select().from(campaign_jobs).where(eq(campaign_jobs.id, id)).limit(1);

    if (row && row.attempts >= 3) {
      await db
        .update(campaign_jobs)
        .set({ status: "failed", last_error: error.slice(0, 999) })
        .where(eq(campaign_jobs.id, id));
    } else {
      await db
        .update(campaign_jobs)
        .set({ attempts: (row?.attempts ?? 0) + 1 })
        .where(eq(campaign_jobs.id, id));
    }
  }

  async cancel_for_campaign(campaign_id: string) {
    await db
      .update(campaign_jobs)
      .set({ status: "failed", last_error: "cancelled" })
      .where(
        and(eq(campaign_jobs.campaign_id, campaign_id), inArray(campaign_jobs.status, ["pending"])),
      );
  }

  async schedule_activation(campaign_id: string, starts_at: string) {
    return this.enqueue(
      CAMPAIGN_JOB_TYPE.activate_campaign,
      campaign_id,
      { campaign_id },
      starts_at,
    );
  }

  async schedule_deactivation(campaign_id: string, ends_at: string) {
    return this.enqueue(
      CAMPAIGN_JOB_TYPE.deactivate_campaign,
      campaign_id,
      { campaign_id },
      ends_at,
    );
  }

  /** Paginated job listing (optional status filter and campaign-name/id search). */
  async list(page: number, limit: number, status?: string, search?: string) {
    const offset = (page - 1) * limit;
    const clauses = [];

    if (status) clauses.push(eq(campaign_jobs.status, status));
    if (search) {
      const needle = `%${search}%`;
      clauses.push(
        or(ilike(campaign_jobs.id, needle), ilike(campaigns.name, needle)),
      );
    }

    const where = clauses.length ? and(...clauses) : undefined;

    const [items, count_rows] = await Promise.all([
      db
        .select({
          id: campaign_jobs.id,
          job_type: campaign_jobs.job_type,
          campaign_id: campaign_jobs.campaign_id,
          campaign_name: campaigns.name,
          status: campaign_jobs.status,
          run_after: campaign_jobs.run_after,
          attempts: campaign_jobs.attempts,
          last_error: campaign_jobs.last_error,
          created_at: campaign_jobs.created_at,
        })
        .from(campaign_jobs)
        .leftJoin(campaigns, eq(campaign_jobs.campaign_id, campaigns.id))
        .where(where)
        .orderBy(desc(campaign_jobs.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(campaign_jobs)
        .leftJoin(campaigns, eq(campaign_jobs.campaign_id, campaigns.id))
        .where(where),
    ]);

    const total = Number(count_rows[0].count);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Aggregated job counts by status. */
  async stats() {
    const statuses = ["pending", "processing", "done", "failed"] as const;
    const [total, ...status_results] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(campaign_jobs),
      ...statuses.map((status) =>
        db
          .select({ count: sql<number>`count(*)` })
          .from(campaign_jobs)
          .where(eq(campaign_jobs.status, status)),
      ),
    ]);

    const counts: Record<string, number> = { total: Number(total[0].count) };
    statuses.forEach((status, index) => {
      counts[status] = Number(status_results[index][0].count);
    });
    return counts;
  }

  /** Cancel a single pending job (no-op otherwise). */
  async cancel_job(id: string) {
    await db
      .update(campaign_jobs)
      .set({ status: "failed", last_error: "cancelled" })
      .where(and(eq(campaign_jobs.id, id), inArray(campaign_jobs.status, ["pending"])));
  }
}

export const campaign_scheduler_repository = new CampaignSchedulerRepository();
