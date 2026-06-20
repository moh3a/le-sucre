import { NextResponse, type NextRequest } from "next/server";

const CSRF_COOKIE = "le_sucre_csrf";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Set CSRF cookie for admin routes if not present
  if (
    pathname.startsWith("/console") ||
    pathname.startsWith("/api/admin")
  ) {
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

  return response;
}

export const config = {
  matcher: ["/console/:path*", "/api/admin/:path*"],
};
