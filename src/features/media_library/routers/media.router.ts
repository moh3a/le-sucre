import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { media_service } from "../services/media.service";
import { create_media_dto, update_media_dto, list_media_dto } from "../models/media.dto";
import { z } from "zod";

export const media_router = create_trpc_router({
  list: permission_procedure(PERMISSIONS.products_read)
    .input(list_media_dto)
    .query(({ input }) => media_service.list(input)),

  byId: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => media_service.get_by_id(input.id)),

  usages: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => media_service.get_usages(input.id)),

  entityMedia: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ entity_type: z.string(), entity_id: z.string() }))
    .query(({ input }) => media_service.get_entity_media(input.entity_type, input.entity_id)),

  delete: permission_procedure(PERMISSIONS.products_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => media_service.delete(input.id)),

  update: permission_procedure(PERMISSIONS.products_write)
    .input(update_media_dto)
    .mutation(({ input }) => media_service.update(input.id, input)),

  attach: permission_procedure(PERMISSIONS.products_write)
    .input(
      z.object({
        media_id: z.string(),
        entity_type: z.string(),
        entity_id: z.string(),
        field: z.string().nullable().optional(),
        is_primary: z.boolean().optional(),
        sort_order: z.number().int().optional(),
      }),
    )
    .mutation(({ input }) => media_service.attach_to_entity(input.media_id, input)),

  detach: permission_procedure(PERMISSIONS.products_write)
    .input(z.object({ usage_id: z.string() }))
    .mutation(({ input }) => media_service.detach_from_entity(input.usage_id)),

  stats: permission_procedure(PERMISSIONS.products_read).query(() => media_service.stats()),
});
