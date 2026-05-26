import { create_trpc_router } from "@/lib/trpc/router";
import {
  permission_procedure,
  protected_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { authorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { PERMISSIONS } from "../authorization/constants/permissions";
import { assign_role_dto } from "./models/auth.dto";
import { role_repository } from "../authorization/repositories/role.repository";

export const auth_router = create_trpc_router({
  me: protected_procedure.query(async ({ ctx }) => {
    const rbac = await authorizationService.get_auth_context(ctx.user.id);
    return { user: ctx.user, ...rbac };
  }),
});

export const admin_auth_router = create_trpc_router({
  assignRole: permission_procedure(PERMISSIONS.roles_manage)
    .input(assign_role_dto)
    .mutation(async ({ input }) => {
      await role_repository.assign_role(input.user_id, input.role_name);
      // TODO implement and uncomment
      //   await audit_service.log({
      //     actor_user_id: ctx.user.id,
      //     action: "role.assigned",
      //     metadata: input,
      //   });
      return { ok: true };
    }),
  //   listUsers: permission_procedure(PERMISSIONS.users_read).query(/* paginated */),
});
