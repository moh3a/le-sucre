import "server-only";
import { campaign_scheduler_repository } from "../repositories/campaign_scheduler.repository";

export class CampaignSchedulerService {
  // TODO: no consumer executes enqueued jobs. Add a cron/poller that calls
  // poll_due() and, for each due job, applies the activation/deactivation and
  // fires the corresponding automation triggers ("campaign.scheduled",
  // "campaign.flash_sale_starting", "campaign.flash_sale_ending").
  async schedule_activation(campaign_id: string, starts_at: string) {
    return campaign_scheduler_repository.schedule_activation(campaign_id, starts_at);
  }

  async schedule_deactivation(campaign_id: string, ends_at: string) {
    return campaign_scheduler_repository.schedule_deactivation(campaign_id, ends_at);
  }

  async cancel_pending(campaign_id: string) {
    return campaign_scheduler_repository.cancel_for_campaign(campaign_id);
  }

  async list_jobs(page: number, limit: number, status?: string, search?: string) {
    return campaign_scheduler_repository.list(page, limit, status, search);
  }

  async get_stats() {
    return campaign_scheduler_repository.stats();
  }

  async cancel_job(id: string) {
    return campaign_scheduler_repository.cancel_job(id);
  }
}

export const campaign_scheduler_service = new CampaignSchedulerService();
