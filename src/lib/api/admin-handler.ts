import { apply_api_guards } from "@/features/authentication_and_authorization/authorization/middleware/api-guards";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError } from "@/lib/error_handling";

type AdminHandler = (ctx: {
  user: { id: string; email: string; name: string };
  rbac: { roles: string[]; permissions: string[] };
  req: Request;
}) => Promise<unknown>;

export function admin_route(handler: AdminHandler, permission?: string) {
  return async (req: Request) => {
    try {
      await apply_api_guards(req, "admin");
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError(), undefined);

      const authz = new AuthorizationService();
      await authz.assert_admin_console(session.user.id);
      if (permission) await authz.assert_permission(session.user.id, permission);

      const rbac = await authz.get_auth_context(session.user.id);
      const data = await handler({ user: session.user, rbac, req });
      return json_ok(data);
    } catch (e) {
      return json_error(e);
    }
  };
}
