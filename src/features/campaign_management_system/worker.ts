import "server-only";

import logger from "@/lib/logger";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { campaign_scheduler_repository } from "./repositories/campaign_scheduler.repository";
import { campaign_repository } from "./repositories/campaign.repository";
import { campaign_cache } from "./services/campaign_cache.service";
import { CAMPAIGN_JOB_TYPE, CAMPAIGN_STATUS } from "./constants/campaign_types";

async function process_campaign_jobs() {
  const jobs = await campaign_scheduler_repository.poll_due(20);

  for (const job of jobs) {
    await campaign_scheduler_repository.mark_processing(job.id);

    try {
      switch (job.job_type) {
        case CAMPAIGN_JOB_TYPE.activate_campaign: {
          const campaign_id =
            (job.payload as { campaign_id?: string }).campaign_id ?? job.campaign_id;
          if (!campaign_id) break;

          const campaign = await campaign_repository.get_by_id(campaign_id);
          if (!campaign) break;

          // Only activate if still in scheduled state
          if (campaign.status === CAMPAIGN_STATUS.scheduled) {
            await campaign_repository.set_status(campaign_id, CAMPAIGN_STATUS.active);
            await campaign_cache.invalidate(campaign_id);
            logger.info("campaign_activated", { campaign_id });
          }
          break;
        }

        case CAMPAIGN_JOB_TYPE.deactivate_campaign: {
          const campaign_id =
            (job.payload as { campaign_id?: string }).campaign_id ?? job.campaign_id;
          if (!campaign_id) break;

          const campaign = await campaign_repository.get_by_id(campaign_id);
          if (!campaign) break;

          if (
            campaign.status === CAMPAIGN_STATUS.active ||
            campaign.status === CAMPAIGN_STATUS.scheduled
          ) {
            await campaign_repository.set_status(campaign_id, CAMPAIGN_STATUS.ended);
            await campaign_cache.invalidate(campaign_id);
            logger.info("campaign_deactivated", { campaign_id });
          }
          break;
        }

        case CAMPAIGN_JOB_TYPE.sync_sections: {
          await campaign_cache.invalidate_all_sections();
          logger.info("campaign_sections_synced");
          break;
        }

        default:
          logger.warn("unknown_campaign_job_type", { job_type: job.job_type });
      }

      await campaign_scheduler_repository.mark_done(job.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("campaign_job_failed", {
        job_id: job.id,
        job_type: job.job_type,
        error: message,
      });
      await campaign_scheduler_repository.mark_failed(job.id, message);
    }
  }
}

run_worker_loop("campaign_jobs", process_campaign_jobs, 10_000);
