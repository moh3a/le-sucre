import "server-only";

import { shipping_repository } from "../repository";
import { shipping_service } from "./shipping.service";
import { assertIsError } from "@/lib/error_handling";
import { addMinutes, addSeconds, format } from "date-fns";

function next_backoff_minutes(attempt: number) {
  return Math.min(60, Math.pow(2, Math.max(0, attempt - 1)));
}

export class ShippingJobRunnerService {
  constructor(private readonly repo = shipping_repository) {}

  async enqueue_tracking_sync(shipment_id: string, delay_seconds = 0) {
    const run_at = format(addSeconds(new Date(), delay_seconds), "yyyy-MM-dd HH:mm:ss");
    await this.repo.create_job({
      job_type: "sync_tracking",
      shipment_id,
      status: "pending",
      attempts: 0,
      max_attempts: 10,
      run_at,
      payload: {},
    });
  }

  async run_due(limit = 20) {
    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const jobs = await this.repo.claim_due_jobs(now, limit);

    for (const job of jobs) {
      try {
        if (job.job_type === "sync_tracking" && job.shipment_id) {
          await shipping_service.sync_tracking(job.shipment_id);
        }
        await this.repo.finish_job(job.id);
      } catch (error) {
        const e = assertIsError(error);
        if (job.attempts >= job.max_attempts) {
          await this.repo.fail_job(job.id, String(e?.message ?? e));
          continue;
        }
        const delay_minutes = next_backoff_minutes(job.attempts);
        const run_at = format(addMinutes(new Date(), delay_minutes), "yyyy-MM-dd HH:mm:ss");
        await this.repo.retry_job(job.id, run_at, String(e?.message ?? e));
      }
    }

    return { processed: jobs.length };
  }
}

export const shipping_job_runner_service = new ShippingJobRunnerService();
