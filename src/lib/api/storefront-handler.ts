import { apply_api_guards } from "@/features/authentication_and_authorization/authorization/middleware/api-guards";
import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError, RateLimitError } from "@/lib/error_handling";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";
import { authorization_audit_service } from "@/lib/security/authorization-audit";

type StorefrontHandler = (ctx: {
  user?: { id: string; email: string; name: string } | null;
  session?: object | null;
  req: Request;
}) => Promise<unknown>;

function get_request_id(req: Request): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function storefront_route(handler: StorefrontHandler) {
  return async (req: Request) => {
    const request_id = get_request_id(req);
    try {
      await apply_api_guards(req, "storefront");
      await assert_ip_not_blacklisted(req);

      const ip = getClientIp(req.headers);
      const rl = await rateLimit(ip, RATE_LIMITS.api);
      if (!rl.success) {
        await authorization_audit_service.log_rate_limit_hit({ identifier: ip, action: "storefront_api" });
        return json_error(new RateLimitError(), 429, request_id);
      }

      const session = await auth.api.getSession({ headers: req.headers });
      const data = await handler({ user: session?.user ?? null, session: session ?? null, req });
      return json_ok(data, 200, request_id);
    } catch (e) {
      return json_error(e, undefined, request_id);
    }
  };
}

export function storefront_auth_route(handler: StorefrontHandler) {
  return async (req: Request) => {
    const request_id = get_request_id(req);
    try {
      await apply_api_guards(req, "storefront");
      await assert_ip_not_blacklisted(req);

      const ip = getClientIp(req.headers);
      const rl = await rateLimit(ip, RATE_LIMITS.api);
      if (!rl.success) {
        await authorization_audit_service.log_rate_limit_hit({ identifier: ip, action: "storefront_auth_api" });
        return json_error(new RateLimitError(), 429, request_id);
      }

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError(), 401, request_id);

      const data = await handler({ user: session.user, session, req });
      return json_ok(data, 200, request_id);
    } catch (e) {
      return json_error(e, undefined, request_id);
    }
  };
}
