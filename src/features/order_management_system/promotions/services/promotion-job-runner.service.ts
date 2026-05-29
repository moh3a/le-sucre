import "server-only";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { promotion_jobs } from "../schema";
import { promotion_scheduler_service } from "./promotion-scheduler.service";

export class PromotionJobRunnerService {
  private async claim_pending(limit: number) {
    return db
      .select()
      .from(promotion_jobs)
      .where(and(eq(promotion_jobs.status, "pending"), lte(promotion_jobs.run_after, sql`NOW()`)))
      .orderBy(asc(promotion_jobs.run_after))
      .limit(limit);
  }

  private mark_done(id: string) {
    return db.update(promotion_jobs).set({ status: "done" }).where(eq(promotion_jobs.id, id));
  }

  private mark_failed(id: string, error: unknown) {
    return db
      .update(promotion_jobs)
      .set({
        status: "failed",
        attempts: sql`${promotion_jobs.attempts} + 1`,
        last_error: error instanceof Error ? error.message : "unknown",
      })
      .where(eq(promotion_jobs.id, id));
  }

  async run_due(limit = 25) {
    const jobs = await this.claim_pending(limit);

    for (const job of jobs) {
      try {
        const flash_sale_id = String(job.payload?.flash_sale_id ?? "");

        if (job.job_type === "activate_flash" && flash_sale_id) {
          await promotion_scheduler_service.activate_flash(flash_sale_id);
        } else if (job.job_type === "deactivate_flash" && flash_sale_id) {
          await promotion_scheduler_service.deactivate_flash(flash_sale_id);
        }

        await this.mark_done(job.id);
      } catch (e) {
        await this.mark_failed(job.id, e);
      }
    }
  }
}

export const promotion_job_runner_service = new PromotionJobRunnerService();
