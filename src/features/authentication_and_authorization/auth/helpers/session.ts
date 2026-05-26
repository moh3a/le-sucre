import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AuthenticationError } from "@/lib/error_handling";

export async function require_session() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new AuthenticationError();
  return session;
}
