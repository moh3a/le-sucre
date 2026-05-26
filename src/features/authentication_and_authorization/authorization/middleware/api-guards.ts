import { env } from "@/config/env";
import { rate_limit } from "@/lib/redis";
import { ForbiddenError } from "@/lib/error_handling";
import { assert_csrf } from "@/features/authentication_and_authorization/auth/helpers/csrf";

export async function assert_origin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== env.BETTER_AUTH_URL) throw new ForbiddenError("Invalid origin");
}

export async function apply_api_guards(req: Request, scope: "admin" | "storefront") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rate_limit(`rl:${scope}:${ip}:${req.method}`, 60, 60);
  if (!rl.allowed) throw new ForbiddenError("Rate limit exceeded");

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    await assert_origin(req);
    await assert_csrf(req);
  }
}
