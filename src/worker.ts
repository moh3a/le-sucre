import "dotenv/config";

import { run_worker_loop } from "@/lib/queue/job-runner";
import { logger } from "@/lib/logger";

import { soft_delete_cleanup_service } from "@/lib/db/soft-delete-cleanup.service";
import { shipping_job_runner_service } from "@/features/fulfillment_management_system/shipping/services/shipping-job-runner.service";
import { reservation_service } from "@/features/fulfillment_management_system/inventory/services/reservation.service";
import { payment_retry_service } from "@/features/payment_management_system/payment/services/payment-retry.service";
import { campaign_scheduler_repository } from "@/features/marketing/campaign/repositories/campaign_scheduler.repository";
import { campaign_repository } from "@/features/marketing/campaign/repositories/campaign.repository";
import { campaign_service } from "@/features/marketing/campaign/services/campaign.service";
import {
  CAMPAIGN_JOB_TYPE,
  CAMPAIGN_STATUS,
} from "@/features/marketing/campaign/constants/campaign_types";
import { forecast_job_runner_service } from "@/features/fulfillment_management_system/forecasting/services/forecast-job-runner.service";
import { index_job_runner_service } from "@/features/product_information_management/recommendations/services/index-job-runner.service";
import { aggregation_job_runner_service } from "@/features/marketing/analytics/services/aggregation-job-runner.service";
import { cart_abandonment_service } from "@/features/marketing/analytics/services/cart-abandonment.service";
import { promotion_job_runner_service } from "@/features/order_management_system/promotions/services/promotion-job-runner.service";
import { preorder_fulfillment_service } from "@/features/order_management_system/preorders/services/preorder-fulfillment.service";
import { preorder_allocation_service } from "@/features/order_management_system/preorders/services/preorder-allocation.service";

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

          if (campaign.status === CAMPAIGN_STATUS.scheduled) {
            // Route through the service layer so the transition is validated and
            // the audit log, webhooks and automation triggers are dispatched.
            await campaign_service.set_status({
              id: campaign_id,
              status: CAMPAIGN_STATUS.active,
            });
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
            await campaign_service.set_status({
              id: campaign_id,
              status: CAMPAIGN_STATUS.ended,
            });
            logger.info("campaign_deactivated", { campaign_id });
          }
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

async function process_payment_jobs() {
  const retry_results = await payment_retry_service.retry_all_failed(3);
  if (retry_results.length > 0) {
    logger.info("payment_retry", {
      attempted: retry_results.length,
      succeeded: retry_results.filter((r) => r.success).length,
    });
  }

  const expired_results = await payment_retry_service.expire_stale_payments(24);
  if (expired_results.length > 0) {
    logger.info("payment_expiry", { expired: expired_results.length });
  }
}

async function process_analytics_jobs() {
  await aggregation_job_runner_service.run_due(10);
  await cart_abandonment_service.track_abandoned();
}

async function process_preorders() {
  const expired = await preorder_allocation_service.expire_stale();
  if (expired > 0) {
    logger.info("preorder_allocations_expired", { expired });
  }
  await preorder_fulfillment_service.fulfill_all_confirmed();
}

run_worker_loop(
  "soft-delete-cleanup",
  () => soft_delete_cleanup_service.runCleanup().then(() => {}),
  300_000,
);
run_worker_loop("shipping", () => shipping_job_runner_service.run_due(25).then(() => {}), 5_000);
run_worker_loop(
  "reservation-expiry",
  () => reservation_service.expire_stale().then(() => {}),
  10_000,
);
run_worker_loop("payment", process_payment_jobs, 30_000);
run_worker_loop("campaign_jobs", process_campaign_jobs, 10_000);
run_worker_loop("inventory-forecast", () => forecast_job_runner_service.run_due(25), 10_000);
run_worker_loop("recommendations-index", () => index_job_runner_service.run_due(25), 5_000);
run_worker_loop("analytics", process_analytics_jobs, 60_000);
run_worker_loop("promotions", () => promotion_job_runner_service.run_due(25), 5_000);
run_worker_loop("preorders", process_preorders, 10_000);
