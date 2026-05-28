import "server-only";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { generate_id } from "@/lib/utils";

export const CART_COOKIE = "ls_cart_id";

export async function get_storefront_identity(req_headers: Headers) {
  const session = await auth.api.getSession({ headers: req_headers });
  const cookie_store = await cookies();
  const cart_id = cookie_store.get(CART_COOKIE)?.value ?? null;

  return {
    user_id: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
    cart_id,
    new_guest_token: cart_id ? null : generate_id().replace(/-/g, "").slice(0, 32),
  };
}

// TODO: Set cookie on first cart creation: httpOnly, sameSite: 'lax', maxAge: 7d.
