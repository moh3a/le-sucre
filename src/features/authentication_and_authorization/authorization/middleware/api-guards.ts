import { env } from "@/config/env";
import { rate_limit } from "@/lib/redis";
import { ForbiddenError, RateLimitError } from "@/lib/error_handling";
import { assert_csrf } from "@/features/authentication_and_authorization/auth/helpers/csrf";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit-presets";
import { ip_blacklist_service } from "@/features/ip_blacklist/services/blacklist.service";

export async function assert_origin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const allowed = [env.BETTER_AUTH_URL];
  if (process.env.ALLOWED_ORIGINS) {
    allowed.push(...process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()));
  }
  const is_allowed = allowed.some((a) => a === origin);
  if (!is_allowed) throw new ForbiddenError("Invalid origin");
}

export async function assert_content_type(req: Request) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const ct = req.headers.get("content-type")?.toLowerCase() ?? "";
    const allowed = [
      "application/json",
      "multipart/form-data",
      "application/x-www-form-urlencoded",
    ];
    const ok = allowed.some((a) => ct.startsWith(a));
    if (!ok) throw new ForbiddenError("Invalid content-type");
  }
}

export async function apply_api_guards(req: Request, scope: "admin" | "storefront") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (ip !== "unknown" && ip !== "127.0.0.1" && ip !== "::1") {
    const blocked = await ip_blacklist_service.is_blacklisted(ip);
    if (blocked) throw new ForbiddenError("Adresse IP bloquée / IP blocked / تم حظر العنوان");
  }

  const preset = scope === "admin" ? RATE_LIMIT_PRESETS.admin_api : RATE_LIMIT_PRESETS.global_api;
  const key = `rl:${scope}:${ip}`;
  const rl = await rate_limit(key, preset.limit, preset.window_sec);
  if (!rl.allowed) throw new RateLimitError();

  await assert_content_type(req);

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    await assert_origin(req);
    await assert_csrf(req);
  }
}
