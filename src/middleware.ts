import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const CONSOLE_PREFIX = "/console";
const AUTH_PATH = "/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  const has_session = Boolean(getSessionCookie(request));

  if (pathname.startsWith(CONSOLE_PREFIX) && !has_session) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(AUTH_PATH) && has_session && !request.nextUrl.searchParams.get("force")) {
    const next = request.nextUrl.searchParams.get("next") ?? CONSOLE_PREFIX;
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/console/:path*", "/auth/:path*"],
};
