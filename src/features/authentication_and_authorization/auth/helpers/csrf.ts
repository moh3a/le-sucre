import { cookies } from "next/headers";
import { ForbiddenError } from "@/lib/error_handling";

const CSRF_COOKIE = "le_sucre_csrf";

export async function issue_csrf_token() {
  const token = crypto.randomUUID();
  (await cookies()).set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return token;
}

export async function assert_csrf(req: Request) {
  const cookie = (await cookies()).get(CSRF_COOKIE)?.value;
  const header = req.headers.get("x-csrf-token");
  if (!cookie || !header || cookie !== header) throw new ForbiddenError("Invalid CSRF token");
}
