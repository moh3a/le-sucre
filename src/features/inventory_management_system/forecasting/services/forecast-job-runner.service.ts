import "server-only";
import { rebuild_velocity_from_orders } from "../engines/sales-trend.engine";
import { demand_forecast_service } from "./demand-forecast.service";
import { alert_service } from "./alert.service";
import { forecast_job_repository } from "../repositories/forecast.repository";

export class ForecastJobRunnerService {
  async run_due(limit = 25) {
    const jobs = await forecast_job_repository.claim_pending(limit);
    for (const job of jobs) {
      try {
        if (job.job_type === "rebuild_velocity") {
          await rebuild_velocity_from_orders(90);
        } else if (job.job_type === "reindex_sku") {
          const sku_id = String(job.payload.sku_id);
          await demand_forecast_service.recompute_sku(sku_id);
          await alert_service.evaluate_sku(sku_id);
        } else if (job.job_type === "reindex_batch") {
          const sku_ids = (job.payload.sku_ids as string[]) ?? [];
          for (const sku_id of sku_ids) {
            await demand_forecast_service.recompute_sku(sku_id);
            await alert_service.evaluate_sku(sku_id);
          }
        }
        await forecast_job_repository.mark_done(job.id);
      } catch (e) {
        await forecast_job_repository.mark_failed(job.id, e);
      }
    }
  }
}

export const forecast_job_runner_service = new ForecastJobRunnerService();
