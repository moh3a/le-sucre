import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { AUTH_ERROR } from "./constants/error-codes";
import { AUTHORIZATION_ERROR } from "@/features/authentication_and_authorization/authorization/constants/error-codes";
import {
  ROLE_NAMES,
  type RoleName,
} from "@/features/authentication_and_authorization/authorization/constants/roles";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { authorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { AUDIT_ACTION } from "@/features/authentication_and_authorization/constants/audit-actions";
import { user_repository } from "./repositories/user.repository";

export class AuthService {
  async get_session() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw_error(AUTH_ERROR.SESSION_REQUIRED);
    return session;
  }

  async get_optional_session() {
    return auth.api.getSession({ headers: await headers() });
  }

  /** Call after Better Auth sign-up (storefront). */
  async on_customer_registered(user_id: string) {
    await role_repository.assign_role(user_id, ROLE_NAMES.customer);
    await audit_service.log({
      actor_user_id: user_id,
      action: AUDIT_ACTION.AUTH_REGISTER_CUSTOMER,
      resource_type: "user",
      resource_id: user_id,
    });
  }

  /** Call when inviting staff (admin API). */
  async on_staff_role_assigned(user_id: string, role_name: RoleName, actor_user_id: string) {
    await role_repository.assign_role(user_id, role_name);
    await audit_service.log({
      actor_user_id,
      action: AUDIT_ACTION.AUTH_STAFF_ROLE_ASSIGNED,
      resource_type: "user",
      resource_id: user_id,
      metadata: { role_name },
    });
  }

  async assert_console_access(user_id: string) {
    try {
      await authorizationService.assert_admin_console(user_id);
    } catch {
      throw_error(AUTHORIZATION_ERROR.CONSOLE_ACCESS_REQUIRED);
    }
  }

  async record_login_success(user_id: string, meta?: { ip_address?: string; user_agent?: string }) {
    await audit_service.log({
      actor_user_id: user_id,
      action: AUDIT_ACTION.AUTH_LOGIN_SUCCESS,
      resource_type: "user",
      resource_id: user_id,
      ...meta,
    });
  }

  async record_login_failure(email: string, meta?: Record<string, unknown>) {
    const user = await user_repository.find_by_email(email);
    await audit_service.log({
      actor_user_id: user?.id,
      action: AUDIT_ACTION.AUTH_LOGIN_FAILURE,
      metadata: { email, ...meta },
    });
  }

  async record_logout(user_id: string) {
    await audit_service.log({
      actor_user_id: user_id,
      action: AUDIT_ACTION.AUTH_LOGOUT,
      resource_type: "user",
      resource_id: user_id,
    });
  }
}

export const auth_service = new AuthService();
