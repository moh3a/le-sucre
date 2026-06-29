import { apply_api_guards } from "@/features/authentication_and_authorization/authorization/middleware/api-guards";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError, AppError } from "@/lib/error_handling";
import { ownership_service } from "@/lib/security/ownership";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";
import { authorization_audit_service } from "@/lib/security/authorization-audit";

type AdminHandler = (ctx: {
  user: { id: string; email: string; name: string };
  rbac: { roles: string[]; permissions: string[] };
  req: Request;
}) => Promise<unknown>;

interface OwnershipConfig {
  type: "order" | "customer" | "product" | "review" | "shipping";
  param_name: string;
  operator_field?: string;
  delivery_field?: string;
}

function get_request_id(req: Request): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function admin_route(handler: AdminHandler, permission?: string) {
  return async (req: Request) => {
    const request_id = get_request_id(req);
    try {
      await apply_api_guards(req, "admin");
      await assert_ip_not_blacklisted(req);

      const ip = getClientIp(req.headers);
      const rl = await rateLimit(ip, RATE_LIMITS.adminApi);
      if (!rl.success) {
        await authorization_audit_service.log_rate_limit_hit({ identifier: ip, action: "admin_api" });
        return json_error(new AppError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429), 429, request_id);
      }

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError(), 401, request_id);

      const authz = new AuthorizationService();
      await authz.assert_admin_console(session.user.id);
      if (permission) {
        try {
          await authz.assert_permission(session.user.id, permission);
        } catch {
          await authorization_audit_service.log_access_attempt({
            user_id: session.user.id,
            action: permission,
            resource_type: "admin",
            result: "denied",
            reason: "missing_permission",
            req,
          });
          throw new AppError("Permission denied", "FORBIDDEN_ACCESS", 403);
        }
      }

      const rbac = await authz.get_auth_context(session.user.id);
      const data = await handler({
        user: {
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.name ?? "",
        },
        rbac,
        req,
      });

      return json_ok(data, 200, request_id);
    } catch (e) {
      return json_error(e, undefined, request_id);
    }
  };
}

export function ownership_aware_admin_route(
  handler: AdminHandler,
  permission: string,
  ownership: OwnershipConfig,
) {
  return async (req: Request) => {
    const request_id = get_request_id(req);
    try {
      await apply_api_guards(req, "admin");
      await assert_ip_not_blacklisted(req);

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError(), 401, request_id);

      const authz = new AuthorizationService();
      await authz.assert_admin_console(session.user.id);
      try {
        await authz.assert_permission(session.user.id, permission);
      } catch {
        await authorization_audit_service.log_access_attempt({
          user_id: session.user.id,
          action: permission,
          resource_type: ownership.type,
          result: "denied",
          reason: "missing_permission",
          req,
        });
        throw new AppError("Permission denied", "FORBIDDEN_ACCESS", 403);
      }

      const rbac = await authz.get_auth_context(session.user.id);

      if (ownership.type === "order") {
        ownership_service.assert_operator_access(
          null,
          session.user.id,
          rbac.roles,
        );
      }
      if (ownership.type === "shipping") {
        ownership_service.assert_delivery_access(
          null,
          session.user.id,
          rbac.roles,
        );
      }

      const data = await handler({ user: {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
      }, rbac, req });
      return json_ok(data, 200, request_id);
    } catch (e) {
      return json_error(e, undefined, request_id);
    }
  };
}
