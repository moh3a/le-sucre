import "server-only";
import type { z } from "zod";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { CAMPAIGN_ERROR } from "../constants/error-codes";
import { slugify } from "@/lib/utils";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { campaign_repository } from "../repositories/campaign.repository";
import { campaign_scheduler_service } from "./campaign_scheduler.service";
import { campaign_cache } from "./campaign_cache.service";
import { campaign_webhooks_service } from "./campaign_webhooks.service";
import { campaign_automation_service } from "./campaign_automation.service";
import type { AutomationTrigger } from "./campaign_automation.service";
import type { CampaignWebhookEvent } from "./campaign_webhooks.service";
import { CAMPAIGN_STATUS } from "../constants/campaign_types";
import type {
  create_campaign_dto,
  update_campaign_dto,
  list_campaigns_dto,
  set_campaign_status_dto,
  add_banner_dto,
  update_banner_dto,
  reorder_banners_dto,
  add_section_dto,
  update_section_dto,
  storefront_home_sections_dto,
  track_campaign_event_dto,
} from "../models/campaign.dto";

export class CampaignService {
  // ─── Admin Queries ─────────────────────────────────────────────────────────

  async list(input: z.infer<typeof list_campaigns_dto>) {
    return campaign_repository.list_admin(
      input.page,
      input.limit,
      input.status,
      input.campaign_type,
      input.search,
    );
  }

  async get_by_id(id: string) {
    const campaign = await campaign_repository.get_full(id);
    if (!campaign) throw_error(CAMPAIGN_ERROR.NOT_FOUND);
    return campaign;
  }

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(input: z.infer<typeof create_campaign_dto>, actor_id?: string) {
    const slug = input.slug ?? slugify(input.name);

    const existing = await campaign_repository.get_by_slug(slug);
    if (existing) throw_error(CAMPAIGN_ERROR.SLUG_CONFLICT);

    const campaign = await campaign_repository.create({
      ...input,
      slug,
      description: input.description ?? null,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      promotion_id: input.promotion_id ?? null,
      ab_test_group: input.ab_test_group ?? null,
      created_by: actor_id ?? null,
    });

    if (campaign && input.status === CAMPAIGN_STATUS.scheduled && input.starts_at) {
      await campaign_scheduler_service.schedule_activation(campaign.id, input.starts_at);
    }
    if (campaign && input.ends_at) {
      await campaign_scheduler_service.schedule_deactivation(campaign.id, input.ends_at);
    }

    await campaign_cache.invalidate_all_sections();

    void audit_service.log({
      action: "campaign.create",
      resource_type: "campaign_id",
      resource_id: campaign?.id,
    });

    if (campaign) {
      void campaign_webhooks_service.dispatch_async("campaign.created", campaign);
      void campaign_automation_service.process_trigger(
        "campaign.activated" as AutomationTrigger,
        campaign,
      );
    }

    return campaign;
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  async update(input: z.infer<typeof update_campaign_dto>) {
    const existing = await campaign_repository.get_by_id(input.id);
    if (!existing) throw_error(CAMPAIGN_ERROR.NOT_FOUND);

    if (input.slug && input.slug !== existing.slug) {
      const conflict = await campaign_repository.get_by_slug(input.slug);
      if (conflict && conflict.id !== input.id) {
        throw_error(CAMPAIGN_ERROR.SLUG_CONFLICT);
      }
    }

    const updated = await campaign_repository.update(input.id, {
      name: input.name,
      slug: input.slug,
      description: input.description,
      campaign_type: input.campaign_type,
      status: input.status,
      priority: input.priority,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      content: input.content as Record<string, unknown> | undefined,
      theme: input.theme as Record<string, unknown> | undefined,
      promotion_id: input.promotion_id,
      ab_test_group: input.ab_test_group,
      ab_traffic_split: input.ab_traffic_split,
      metadata: input.metadata,
      translations: input.translations,
      banners: input.banners as typeof input.banners,
      sections: input.sections as typeof input.sections,
      targets: input.targets as typeof input.targets,
      category_ids: input.category_ids,
      brand_ids: input.brand_ids,
    });

    // Re-schedule if dates changed
    if (input.starts_at || input.ends_at) {
      await campaign_scheduler_service.cancel_pending(input.id);
      if (input.starts_at && updated?.status === CAMPAIGN_STATUS.scheduled) {
        await campaign_scheduler_service.schedule_activation(input.id, input.starts_at);
      }
      if (input.ends_at) {
        await campaign_scheduler_service.schedule_deactivation(input.id, input.ends_at);
      }
    }

    await campaign_cache.invalidate(input.id);

    void audit_service.log({
      action: "campaign.update",
      resource_type: "campaign_id",
      resource_id: input.id,
    });

    if (updated) {
      void campaign_webhooks_service.dispatch_async("campaign.updated", updated, {
        changes: Object.keys(input),
      });
    }

    return updated;
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  async set_status(input: z.infer<typeof set_campaign_status_dto>) {
    const existing = await campaign_repository.get_by_id(input.id);
    if (!existing) throw_error(CAMPAIGN_ERROR.NOT_FOUND);

    this._validate_transition(existing.status, input.status);

    const updated = await campaign_repository.set_status(input.id, input.status);
    await campaign_cache.invalidate(input.id);

    void audit_service.log({
      action: `campaign.status.${input.status}`,
      resource_type: "campaign_id",
      resource_id: input.id,
    });

    if (updated) {
      const event_map: Record<string, CampaignWebhookEvent> = {
        [CAMPAIGN_STATUS.active]: "campaign.activated",
        [CAMPAIGN_STATUS.paused]: "campaign.paused",
        [CAMPAIGN_STATUS.ended]: "campaign.ended",
        [CAMPAIGN_STATUS.cancelled]: "campaign.cancelled",
        [CAMPAIGN_STATUS.scheduled]: "campaign.scheduled",
      };
      const webhook_event = event_map[input.status];
      if (webhook_event) {
        void campaign_webhooks_service.dispatch_async(webhook_event, updated);
      }

      const trigger_map: Record<string, AutomationTrigger> = {
        [CAMPAIGN_STATUS.active]: "campaign.activated",
        [CAMPAIGN_STATUS.ended]: "campaign.ended",
        [CAMPAIGN_STATUS.paused]: "campaign.paused",
      };
      const auto_trigger = trigger_map[input.status];
      if (auto_trigger) {
        void campaign_automation_service.process_trigger(auto_trigger, updated);
      }
    }

    return updated;
  }

  private _validate_transition(from: string, to: string) {
    const allowed: Record<string, string[]> = {
      draft: ["scheduled", "active", "cancelled"],
      scheduled: ["active", "paused", "cancelled"],
      active: ["paused", "ended", "cancelled"],
      paused: ["active", "ended", "cancelled"],
      ended: [],
      cancelled: [],
    };
    if (!allowed[from]?.includes(to)) {
      throw_error(CAMPAIGN_ERROR.DATE_RANGE_INVALID, { from, to });
    }
  }

  // ─── Banners ───────────────────────────────────────────────────────────────

  async add_banner(input: z.infer<typeof add_banner_dto>) {
    const campaign = await campaign_repository.get_by_id(input.campaign_id);
    if (!campaign) throw_error(CAMPAIGN_ERROR.NOT_FOUND);

    const { campaign_id, ...banner_data } = input;
    const banner = await campaign_repository.add_banner(
      campaign_id,
      banner_data as Parameters<typeof campaign_repository.add_banner>[1],
    );
    await campaign_cache.invalidate(campaign_id);
    return banner;
  }

  async update_banner(input: z.infer<typeof update_banner_dto>) {
    const { id, ...data } = input;
    const banner = await campaign_repository.update_banner(
      id,
      data as Parameters<typeof campaign_repository.update_banner>[1],
    );
    if (!banner) throw_error(CAMPAIGN_ERROR.BANNER_NOT_FOUND);
    await campaign_cache.invalidate_all_sections();
    return banner;
  }

  async delete_banner(id: string) {
    await campaign_repository.delete_banner(id);
    await campaign_cache.invalidate_all_sections();
  }

  async reorder_banners(input: z.infer<typeof reorder_banners_dto>) {
    await campaign_repository.reorder_banners(input.campaign_id, input.ordered_ids);
    await campaign_cache.invalidate(input.campaign_id);
  }

  // ─── Sections ──────────────────────────────────────────────────────────────

  async add_section(input: z.infer<typeof add_section_dto>) {
    const campaign = await campaign_repository.get_by_id(input.campaign_id);
    if (!campaign) throw_error(CAMPAIGN_ERROR.NOT_FOUND);

    const { campaign_id, ...section_data } = input;
    const section = await campaign_repository.add_section(
      campaign_id,
      section_data as Parameters<typeof campaign_repository.add_section>[1],
    );
    await campaign_cache.invalidate(campaign_id);
    return section;
  }

  async update_section(input: z.infer<typeof update_section_dto>) {
    const { id, ...data } = input;
    const section = await campaign_repository.update_section(
      id,
      data as Parameters<typeof campaign_repository.update_section>[1],
    );
    if (!section) throw_error(CAMPAIGN_ERROR.SECTION_NOT_FOUND);
    await campaign_cache.invalidate_all_sections();
    return section;
  }

  async delete_section(id: string) {
    await campaign_repository.delete_section(id);
    await campaign_cache.invalidate_all_sections();
  }

  // ─── Storefront ────────────────────────────────────────────────────────────

  async get_storefront_sections(input: z.infer<typeof storefront_home_sections_dto>) {
    const country = input.country ?? "";

    const cached = await campaign_cache.get_active_sections(input.page_slug, input.locale, country);
    if (cached) return cached;

    const campaigns = await campaign_repository.list_active_for_page(
      input.page_slug,
      input.locale,
      country,
      input.user_id,
    );

    await campaign_cache.set_active_sections(input.page_slug, input.locale, country, campaigns);
    return campaigns;
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  async track_event(input: z.infer<typeof track_campaign_event_dto>) {
    const field_map: Record<
      string,
      "impressions" | "clicks" | "banner_clicks" | "add_to_cart" | "conversions"
    > = {
      impression: "impressions",
      click: "clicks",
      banner_click: "banner_clicks",
      add_to_cart: "add_to_cart",
      conversion: "conversions",
    };

    const field = field_map[input.event_type];
    if (field) {
      await campaign_repository.increment_analytics(input.campaign_id, field, input.revenue ?? 0);
    }
  }

  async get_analytics(campaign_id: string, from: string, to: string) {
    const [timeseries, summary] = await Promise.all([
      campaign_repository.get_analytics_range(campaign_id, from, to),
      campaign_repository.get_analytics_summary(campaign_id),
    ]);
    return { timeseries, summary };
  }

  async list_ab_test_groups(): Promise<string[]> {
    const { db } = await import("@/lib/db");
    const { campaigns } = await import("../schema");
    const { sql } = await import("drizzle-orm");
    const rows = await db
      .select({ group: sql<string>`DISTINCT ${campaigns.ab_test_group}` })
      .from(campaigns)
      .where(sql`${campaigns.ab_test_group} IS NOT NULL AND ${campaigns.ab_test_group} != ''`);
    return rows.map((r) => r.group).filter(Boolean);
  }
}

export const campaign_service = new CampaignService();
