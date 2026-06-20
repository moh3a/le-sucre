import { apply_api_guards } from "@/features/authentication_and_authorization/authorization/middleware/api-guards";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError, AppError } from "@/lib/error_handling";
import { redaction_service } from "@/lib/security/redaction";
import { ownership_service } from "@/lib/security/ownership";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";

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

export function admin_route(handler: AdminHandler, permission?: string) {
  return async (req: Request) => {
    try {
      await apply_api_guards(req, "admin");

      const ip = getClientIp(req.headers);
      const rl = await rateLimit(ip, RATE_LIMITS.adminApi);
      if (!rl.success) {
        return json_error(new AppError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429));
      }

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError());

      const authz = new AuthorizationService();
      await authz.assert_admin_console(session.user.id);
      if (permission) await authz.assert_permission(session.user.id, permission);

      const rbac = await authz.get_auth_context(session.user.id);
      const redacted = redaction_service.redact(session.user);
      const data = await handler({
        user: session.user,
        rbac,
        req,
      });

      return json_ok(data);
    } catch (e) {
      return json_error(e);
    }
  };
}

export function ownership_aware_admin_route(
  handler: AdminHandler,
  permission: string,
  ownership: OwnershipConfig,
) {
  return async (req: Request) => {
    try {
      await apply_api_guards(req, "admin");

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError());

      const authz = new AuthorizationService();
      await authz.assert_admin_console(session.user.id);
      await authz.assert_permission(session.user.id, permission);

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

      const data = await handler({ user: session.user, rbac, req });
      return json_ok(data);
    } catch (e) {
      return json_error(e);
    }
  };
}
