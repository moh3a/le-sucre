import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { settings_service } from "../services/settings.service";

export const settings_router = create_trpc_router({
  getAll: permission_procedure(PERMISSIONS.settings_read).query(() => settings_service.get_all()),

  getCategory: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ category: z.string().min(1).max(64) }))
    .query(({ input }) => settings_service.get_category(input.category)),

  updateMany: permission_procedure(PERMISSIONS.settings_write)
    .input(
      z.object({
        entries: z.array(
          z.object({
            key: z.string().min(1).max(255),
            value: z.string(),
            category: z.string().min(1).max(64),
          }),
        ),
      }),
    )
    .mutation(({ input, ctx }) => settings_service.update_many(input.entries, ctx.user.id)),

  getEnvStatus: permission_procedure(PERMISSIONS.settings_read).query(() =>
    settings_service.get_env_status(),
  ),
});
