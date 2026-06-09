import "server-only";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { format, addMinutes } from "date-fns";
import { and, eq, lte, inArray } from "drizzle-orm";
import { campaign_jobs } from "../schema";
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
}

export const campaign_scheduler_repository = new CampaignSchedulerRepository();
