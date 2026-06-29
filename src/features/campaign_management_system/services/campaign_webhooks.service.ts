import "server-only";
import logger from "@/lib/logger";
import { db } from "@/lib/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { mysqlTable, varchar, json, timestamp, index } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

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

export const campaign_webhook_events = mysqlTable(
  "campaign_webhook_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    event_type: varchar("event_type", { length: 64 }).notNull(),
    campaign_id: varchar("campaign_id", { length: 255 }).notNull(),
    payload: json("payload").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("campaign_webhook_events_type_idx").on(t.event_type),
    index("campaign_webhook_events_campaign_idx").on(t.campaign_id),
  ],
);

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
      await db.insert(campaign_webhook_events).values({
        id: generate_id(),
        event_type: event,
        campaign_id: campaign.id,
        payload: payload as unknown as Record<string, unknown>,
        status: "pending",
      });

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

  async get_recent_events(
    campaign_id?: string,
    limit = 20,
  ): Promise<CampaignEventPayload[]> {
    const clauses = [sql`event_type LIKE 'campaign.%'`];
    if (campaign_id) {
      clauses.push(eq(sql`campaign_id`, campaign_id));
    }

    const rows = await db
      .select()
      .from(campaign_webhook_events)
      .where(and(...clauses))
      .orderBy(desc(campaign_webhook_events.created_at))
      .limit(limit);

    return rows.map((r) => r.payload as unknown as CampaignEventPayload);
  }
}

export const campaign_webhooks_service = new CampaignWebhooksService();
