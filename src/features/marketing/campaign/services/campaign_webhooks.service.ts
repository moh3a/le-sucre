import "server-only";
import logger from "@/lib/logger";
import { campaign_webhooks_repository } from "../repositories/campaign_webhooks.repository";

export type CampaignWebhookEvent =
  | "campaign.created"
  | "campaign.updated"
  | "campaign.activated"
  | "campaign.deactivated"
  | "campaign.paused"
  | "campaign.ended"
  | "campaign.cancelled"
  | "campaign.scheduled"
  | "campaign.flash_sale_starting"
  | "campaign.flash_sale_ending"
  | "campaign.analytics_threshold";

interface CampaignEventPayload {
  event: CampaignWebhookEvent;
  campaign_id: string;
  campaign_name: string;
  campaign_type: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class CampaignWebhooksService {
  async dispatch(
    event: CampaignWebhookEvent,
    campaign: {
      id: string;
      name: string;
      campaign_type: string;
      status: string;
      metadata?: Record<string, unknown> | null;
    },
    extra?: Record<string, unknown>,
  ): Promise<void> {
    const payload: CampaignEventPayload = {
      event,
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      campaign_type: campaign.campaign_type,
      status: campaign.status,
      timestamp: new Date().toISOString(),
      metadata: { ...campaign.metadata, ...extra },
    };

    try {
      await campaign_webhooks_repository.insert_event(
        event,
        campaign.id,
        payload as unknown as Record<string, unknown>,
      );

      logger.info("campaign_webhook_dispatched", { event, campaign_id: campaign.id });
    } catch (err) {
      logger.error("campaign_webhook_dispatch_failed", {
        event,
        campaign_id: campaign.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async dispatch_async(
    event: CampaignWebhookEvent,
    campaign: {
      id: string;
      name: string;
      campaign_type: string;
      status: string;
      metadata?: Record<string, unknown> | null;
    },
    extra?: Record<string, unknown>,
  ): Promise<void> {
    void this.dispatch(event, campaign, extra);
  }

  /** Paginated admin listing. */
  async list_events(page: number, limit: number, event_type?: string, status?: string, search?: string) {
    return campaign_webhooks_repository.list(page, limit, event_type, status, search);
  }

  async get_stats() {
    return campaign_webhooks_repository.stats();
  }
}

export const campaign_webhooks_service = new CampaignWebhooksService();
