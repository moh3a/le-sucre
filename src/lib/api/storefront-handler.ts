import { apply_api_guards } from "@/features/authentication_and_authorization/authorization/middleware/api-guards";
import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError } from "@/lib/error_handling";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";

type StorefrontHandler = (ctx: {
  user?: { id: string; email: string; name: string } | null;
  session?: object | null;
  req: Request;
}) => Promise<unknown>;

export function storefront_route(handler: StorefrontHandler) {
  return async (req: Request) => {
    try {
      await apply_api_guards(req, "storefront");
      await assert_ip_not_blacklisted(req);

      const ip = getClientIp(req.headers);
      const rl = await rateLimit(ip, RATE_LIMITS.api);
      if (!rl.success) {
        return json_error(new Error("Rate limit exceeded"), 429);
      }

      const session = await auth.api.getSession({ headers: req.headers });
      const data = await handler({ user: session?.user ?? null, session: session ?? null, req });
      return json_ok(data);
    } catch (e) {
      return json_error(e);
    }
  };
}

export function storefront_auth_route(handler: StorefrontHandler) {
  return async (req: Request) => {
    try {
      await apply_api_guards(req, "storefront");
      await assert_ip_not_blacklisted(req);

      const ip = getClientIp(req.headers);
      const rl = await rateLimit(ip, RATE_LIMITS.api);
      if (!rl.success) {
        return json_error(new Error("Rate limit exceeded"), 429);
      }

      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return json_error(new AuthenticationError());

      const data = await handler({ user: session.user, session, req });
      return json_ok(data);
    } catch (e) {
      return json_error(e);
    }
  };
}
