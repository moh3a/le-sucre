import "server-only";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { campaign_webhook_events, campaigns } from "../schema";

export class CampaignWebhooksRepository {
  async insert_event(
    event_type: string,
    campaign_id: string,
    payload: Record<string, unknown>,
  ) {
    await db.insert(campaign_webhook_events).values({
      id: generate_id(),
      event_type,
      campaign_id,
      payload,
      status: "pending",
    });
  }

  /** Paginated webhook event listing (optional event-type/status filter and campaign-name/id search). */
  async list(page: number, limit: number, event_type?: string, status?: string, search?: string) {
    const offset = (page - 1) * limit;
    const clauses = [];
    clauses.push(sql`${campaign_webhook_events.event_type} LIKE 'campaign.%'`);

    if (event_type) clauses.push(eq(campaign_webhook_events.event_type, event_type));
    if (status) clauses.push(eq(campaign_webhook_events.status, status));
    if (search) {
      const needle = `%${search}%`;
      clauses.push(
        or(ilike(campaign_webhook_events.campaign_id, needle), ilike(campaigns.name, needle)),
      );
    }

    const where = and(...clauses);

    const [items, count_rows] = await Promise.all([
      db
        .select({
          id: campaign_webhook_events.id,
          event_type: campaign_webhook_events.event_type,
          campaign_id: campaign_webhook_events.campaign_id,
          campaign_name: campaigns.name,
          campaign_type: campaigns.campaign_type,
          status: campaign_webhook_events.status,
          created_at: campaign_webhook_events.created_at,
        })
        .from(campaign_webhook_events)
        .leftJoin(campaigns, eq(campaign_webhook_events.campaign_id, campaigns.id))
        .where(where)
        .orderBy(desc(campaign_webhook_events.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(campaign_webhook_events)
        .leftJoin(campaigns, eq(campaign_webhook_events.campaign_id, campaigns.id))
        .where(where),
    ]);

    const total = Number(count_rows[0].count);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Aggregated webhook event counts by delivery status. */
  async stats() {
    const statuses = ["pending", "done", "failed"] as const;
    const [total, ...status_results] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(campaign_webhook_events),
      ...statuses.map((status) =>
        db
          .select({ count: sql<number>`count(*)` })
          .from(campaign_webhook_events)
          .where(eq(campaign_webhook_events.status, status)),
      ),
    ]);

    const counts: Record<string, number> = { total: Number(total[0].count) };
    statuses.forEach((status, index) => {
      counts[status] = Number(status_results[index][0].count);
    });
    return counts;
  }
}

export const campaign_webhooks_repository = new CampaignWebhooksRepository();
