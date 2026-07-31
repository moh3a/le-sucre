import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { feature_flag_service } from "./services/feature_flag.service";
import {
  create_feature_flag_dto,
  update_feature_flag_dto,
  toggle_feature_flag_dto,
  list_feature_flags_dto,
} from "./models/feature_flag.dto";

const id_input = z.object({ id: z.string().min(1).max(255) });

export const feature_flag_router = create_trpc_router({
  list: permission_procedure(PERMISSIONS.settings_read)
    .input(list_feature_flags_dto)
    .query(({ input }) => feature_flag_service.list(input)),

  stats: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({}).optional())
    .query(() => feature_flag_service.stats()),

  byId: permission_procedure(PERMISSIONS.settings_read)
    .input(id_input)
    .query(({ input }) => feature_flag_service.get_by_id(input.id)),

  create: permission_procedure(PERMISSIONS.settings_write)
    .input(create_feature_flag_dto)
    .mutation(({ input }) => feature_flag_service.create(input)),

  update: permission_procedure(PERMISSIONS.settings_write)
    .input(update_feature_flag_dto)
    .mutation(({ input }) => feature_flag_service.update(input)),

  toggle: permission_procedure(PERMISSIONS.settings_write)
    .input(toggle_feature_flag_dto)
    .mutation(({ input }) => feature_flag_service.toggle(input)),

  delete: permission_procedure(PERMISSIONS.settings_write)
    .input(id_input)
    .mutation(({ input }) => feature_flag_service.delete(input.id)),

  isEnabled: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ key: z.string().min(1).max(255) }))
    .query(({ input }) => feature_flag_service.is_enabled(input.key)),
});

export { feature_flag_service };
export type { FeatureFlag } from "./types";
