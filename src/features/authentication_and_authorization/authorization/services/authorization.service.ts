import "server-only";

import {
  ADMIN_CONSOLE_ROLES,
  STAFF_ROLES,
  type RoleName,
} from "@/features/authentication_and_authorization/authorization/constants/roles";
import { RoleRepository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { ForbiddenError } from "@/lib/error_handling";

export class AuthorizationService {
  constructor(private readonly roles = new RoleRepository()) {}

  async get_auth_context(user_id: string) {
    const [role_rows, permission_rows] = await Promise.all([
      this.roles.find_roles_by_user_id(user_id),
      this.roles.find_permissions_by_user_id(user_id),
    ]);
    return {
      roles: role_rows.map((r) => r.name as RoleName),
      permissions: permission_rows.map((p) => p.name),
    };
  }

  async assert_staff(user_id: string) {
    const ok = await this.roles.user_has_role(user_id, STAFF_ROLES);
    if (!ok) throw new ForbiddenError("Accès réservé au personnel");
  }

  async assert_admin_console(user_id: string) {
    const ok = await this.roles.user_has_role(user_id, ADMIN_CONSOLE_ROLES);
    if (!ok) throw new ForbiddenError("Accès console refusé");
  }

  async assert_permission(user_id: string, permission: string) {
    const ok = await this.roles.user_has_permission(user_id, permission);
    if (!ok) throw new ForbiddenError(`Permission requise: ${permission}`);
  }

  async assert_customer(user_id: string) {
    const ok = await this.roles.user_has_role(user_id, ["customer"]);
    if (!ok) throw new ForbiddenError("Compte client requis");
  }
}

export const authorizationService = new AuthorizationService();