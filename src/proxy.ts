import { NextResponse, type NextRequest } from "next/server";

const CSRF_COOKIE = "le_sucre_csrf";

function get_cors_origin(origin: string | null): string {
  if (!origin) return "";
  const envOrigins: string[] =
    process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"];
  if (process.env.ALLOWED_ORIGINS) {
    envOrigins.push(...process.env.ALLOWED_ORIGINS.split(",").map((o: string) => o.trim()));
  }
  if (process.env.BETTER_AUTH_URL && envOrigins.indexOf(process.env.BETTER_AUTH_URL) === -1) {
    envOrigins.push(process.env.BETTER_AUTH_URL);
  }
  return envOrigins.includes(origin) ? origin : "";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const client_ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown";
  if (
    client_ip !== "unknown" &&
    client_ip !== "127.0.0.1" &&
    client_ip !== "::1" &&
    pathname.startsWith("/api/")
  ) {
    try {
      const { default: Redis } = await import("ioredis");
      const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
      });
      const cached = await redis.get(`blacklist:ip:${client_ip}`);
      if (cached === "1") {
        await redis.quit();
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: { code: "IP_BLOCKED", message: "Accès refusé" },
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      await redis.quit();
    } catch {
      // Edge-level blacklist check unavailable — fall through to route-level check
    }
  }

  response.headers.set("x-pathname", pathname);

  const origin = request.headers.get("origin");
  const allowed = get_cors_origin(origin);
  if (allowed) {
    response.headers.set("Access-Control-Allow-Origin", allowed);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-csrf-token, x-request-id");
    response.headers.set("Access-Control-Expose-Headers", "x-request-id");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "7200");
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  if (pathname.startsWith("/console") || pathname.startsWith("/api/admin")) {
    if (!request.cookies.has(CSRF_COOKIE)) {
      const token = crypto.randomUUID();
      response.cookies.set(CSRF_COOKIE, token, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()",
  );
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|media/).*)",
  ],
};
