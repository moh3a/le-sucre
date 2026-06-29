import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { campaign_service } from "./services/campaign.service";
import { campaign_repository } from "./repositories/campaign.repository";
import { campaign_ab_test_service } from "./services/campaign_ab_test.service";
import { campaign_flash_sale_service } from "./services/campaign_flash_sale.service";
import { campaign_landing_page_service } from "./services/campaign_landing_page.service";
import { campaign_webhooks_service } from "./services/campaign_webhooks.service";
import { campaign_automation_service } from "./services/campaign_automation.service";
import {
  list_campaigns_dto,
  create_campaign_dto,
  update_campaign_dto,
  set_campaign_status_dto,
  add_banner_dto,
  update_banner_dto,
  reorder_banners_dto,
  add_section_dto,
  update_section_dto,
  storefront_home_sections_dto,
  track_campaign_event_dto,
} from "./models/campaign.dto";

const id_input = z.object({ id: z.string().min(1).max(255) });

export const campaign_router = create_trpc_router({
  // ─── Admin ─────────────────────────────────────────────────────────────────

  adminList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(list_campaigns_dto)
    .query(({ input }) => campaign_service.list(input)),

  campaignStats: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({}).optional())
    .query(() => campaign_repository.stats()),

  byId: permission_procedure(PERMISSIONS.campaigns_read)
    .input(id_input)
    .query(({ input }) => campaign_service.get_by_id(input.id)),

  create: permission_procedure(PERMISSIONS.campaigns_write)
    .input(create_campaign_dto)
    .mutation(({ input, ctx }) => campaign_service.create(input, ctx.session?.user?.id)),

  update: permission_procedure(PERMISSIONS.campaigns_write)
    .input(update_campaign_dto)
    .mutation(({ input }) => campaign_service.update(input)),

  setStatus: permission_procedure(PERMISSIONS.campaigns_write)
    .input(set_campaign_status_dto)
    .mutation(({ input }) => campaign_service.set_status(input)),

  // ─── Banner management ─────────────────────────────────────────────────────

  addBanner: permission_procedure(PERMISSIONS.campaigns_write)
    .input(add_banner_dto)
    .mutation(({ input }) => campaign_service.add_banner(input)),

  updateBanner: permission_procedure(PERMISSIONS.campaigns_write)
    .input(update_banner_dto)
    .mutation(({ input }) => campaign_service.update_banner(input)),

  deleteBanner: permission_procedure(PERMISSIONS.campaigns_write)
    .input(id_input)
    .mutation(({ input }) => campaign_service.delete_banner(input.id)),

  reorderBanners: permission_procedure(PERMISSIONS.campaigns_write)
    .input(reorder_banners_dto)
    .mutation(({ input }) => campaign_service.reorder_banners(input)),

  // ─── Section management ────────────────────────────────────────────────────

  addSection: permission_procedure(PERMISSIONS.campaigns_write)
    .input(add_section_dto)
    .mutation(({ input }) => campaign_service.add_section(input)),

  updateSection: permission_procedure(PERMISSIONS.campaigns_write)
    .input(update_section_dto)
    .mutation(({ input }) => campaign_service.update_section(input)),

  deleteSection: permission_procedure(PERMISSIONS.campaigns_write)
    .input(id_input)
    .mutation(({ input }) => campaign_service.delete_section(input.id)),

  // ─── A/B Testing ───────────────────────────────────────────────────────────

  abTestVariant: public_procedure
    .input(
      z.object({
        test_group: z.string().min(1).max(64),
        user_id: z.string().optional(),
        session_seed: z.number().int().optional(),
      }),
    )
    .query(({ input }) =>
      campaign_ab_test_service.get_variant_for_user(input.test_group, input.user_id, input.session_seed),
    ),

  abTestReport: permission_procedure(PERMISSIONS.campaigns_read)
    .input(
      z.object({
        test_group: z.string().min(1).max(64),
        days: z.number().int().min(1).max(365).default(30),
      }),
    )
    .query(({ input }) => campaign_ab_test_service.get_ab_test_report(input.test_group, input.days)),

  abTestGroups: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => campaign_service.list_ab_test_groups()),

  // ─── Flash Sales ───────────────────────────────────────────────────────────

  activeFlashSales: public_procedure
    .input(z.object({ locale: z.string().optional() }))
    .query(({ input }) => campaign_flash_sale_service.get_active_flash_sales(input.locale)),

  flashSaleBySlug: public_procedure
    .input(z.object({ slug: z.string().min(1).max(255) }))
    .query(({ input }) => campaign_flash_sale_service.get_flash_sale_by_slug(input.slug)),

  // ─── Landing Pages ─────────────────────────────────────────────────────────

  landingPage: public_procedure
    .input(
      z.object({
        slug: z.string().min(1).max(255),
        locale: z.string().default("fr"),
        user_id: z.string().optional(),
      }),
    )
    .query(({ input }) =>
      campaign_landing_page_service.get_landing_page(input.slug, input.locale, input.user_id),
    ),

  landingPagesList: public_procedure
    .input(z.object({ locale: z.string().default("fr") }))
    .query(({ input }) => campaign_landing_page_service.get_landing_pages_for_storefront(input.locale)),

  // ─── Webhook Events ────────────────────────────────────────────────────────

  webhookEvents: permission_procedure(PERMISSIONS.campaigns_read)
    .input(
      z.object({
        campaign_id: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => campaign_webhooks_service.get_recent_events(input.campaign_id, input.limit)),

  // ─── Automation Rules ──────────────────────────────────────────────────────

  automationRules: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => campaign_automation_service.list_rules()),

  createAutomationRule: permission_procedure(PERMISSIONS.campaigns_write)
    .input(
      z.object({
        name: z.string().min(1).max(255),
        trigger: z.string().min(1).max(64),
        action: z.string().min(1).max(64),
        campaign_type_filter: z.string().optional(),
        status_filter: z.string().optional(),
        config: z.record(z.string(), z.unknown()).default({}),
        priority: z.number().int().min(1).max(9999).default(100),
      }),
    )
    .mutation(({ input }) =>
      campaign_automation_service.create_rule({
        ...input,
        trigger: input.trigger as any,
        action: input.action as any,
      }),
    ),

  automationLogs: permission_procedure(PERMISSIONS.campaigns_read)
    .input(
      z.object({
        campaign_id: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(({ input }) => campaign_automation_service.get_logs(input.campaign_id, input.limit)),

  automationRuleToggle: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string(), is_active: z.boolean() }))
    .mutation(async ({ input }) => {
      const { db } = await import("@/lib/db");
      const { campaign_automation_rules } = await import("./services/campaign_automation.service");
      const { eq } = await import("drizzle-orm");
      await db.update(campaign_automation_rules).set({ is_active: input.is_active }).where(eq(campaign_automation_rules.id, input.id));
    }),

  automationRuleDelete: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { db } = await import("@/lib/db");
      const { campaign_automation_rules } = await import("./services/campaign_automation.service");
      const { eq } = await import("drizzle-orm");
      await db.delete(campaign_automation_rules).where(eq(campaign_automation_rules.id, input.id));
    }),

  // ─── Landing Pages (Admin) ─────────────────────────────────────────────────

  landingPagesAdmin: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => campaign_service.list({ campaign_type: "landing_page", page: 1, limit: 100 })),

  // ─── Flash Sales (Admin) ───────────────────────────────────────────────────

  flashSalesAdmin: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => campaign_service.list({ campaign_type: "flash_sale", page: 1, limit: 100 })),

  // ─── Analytics ─────────────────────────────────────────────────────────────

  analytics: permission_procedure(PERMISSIONS.campaigns_read)
    .input(
      z.object({
        campaign_id: z.string().min(1).max(255),
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .query(({ input }) => campaign_service.get_analytics(input.campaign_id, input.from, input.to)),

  // ─── Public storefront ─────────────────────────────────────────────────────

  storefrontSections: public_procedure
    .input(storefront_home_sections_dto)
    .query(({ input }) => campaign_service.get_storefront_sections(input)),

  trackEvent: public_procedure
    .input(track_campaign_event_dto)
    .mutation(({ input }) => campaign_service.track_event(input)),
});
