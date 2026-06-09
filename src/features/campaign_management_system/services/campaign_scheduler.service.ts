import "server-only";
import { campaign_scheduler_repository } from "../repositories/campaign_scheduler.repository";

export class CampaignSchedulerService {
  async schedule_activation(campaign_id: string, starts_at: string) {
    return campaign_scheduler_repository.schedule_activation(campaign_id, starts_at);
  }

  async schedule_deactivation(campaign_id: string, ends_at: string) {
    return campaign_scheduler_repository.schedule_deactivation(campaign_id, ends_at);
  }

  async cancel_pending(campaign_id: string) {
    return campaign_scheduler_repository.cancel_for_campaign(campaign_id);
  }
}

export const campaign_scheduler_service = new CampaignSchedulerService();
