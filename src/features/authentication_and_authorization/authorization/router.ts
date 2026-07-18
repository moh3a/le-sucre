import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export const authorization_router = create_trpc_router({
  stats: permission_procedure(PERMISSIONS.roles_manage).query(() =>
    role_repository.stats(),
  ),

  listRoles: permission_procedure(PERMISSIONS.roles_manage).query(() =>
    role_repository.list_roles_with_permissions(),
  ),

  updateRolePermissions: permission_procedure(PERMISSIONS.roles_manage)
    .input(
      z.object({
        role_name: z.string().min(1),
        permissions: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await role_repository.replace_role_permissions(input.role_name, input.permissions);
      await audit_service.log({
        actor_user_id: ctx.user.id,
        action: "role.permissions.updated",
        resource_type: "role",
        resource_id: input.role_name,
        metadata: input,
      });
      return { ok: true };
    }),
});
