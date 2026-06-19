import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { campaign_service } from "./services/campaign.service";
import { campaign_repository } from "./repositories/campaign.repository";
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
