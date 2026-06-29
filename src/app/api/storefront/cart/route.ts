import { json_ok, json_error } from "@/lib/http";
import {
  get_storefront_identity,
  CART_COOKIE,
} from "@/features/order_management_system/carts/cart-context.helper";
import { cart_service } from "@/features/order_management_system/carts/cart.service";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    await assert_ip_not_blacklisted(req);

    const ip = getClientIp(req.headers);
    const rl = await rateLimit(ip, RATE_LIMITS.api);
    if (!rl.success) {
      const { RateLimitError } = await import("@/lib/error_handling");
      throw new RateLimitError();
    }

    const identity = await get_storefront_identity(req.headers);
    const cart = await cart_service.get_or_create_cart({
      user_id: identity.user_id,
      cart_id: identity.cart_id,
      guest_token: identity.new_guest_token ?? undefined,
    });
    const view = await cart_service.get_cart_view(cart.id);
    const res = json_ok(view);
    if (!identity.cart_id && cart.id) {
      res.cookies.set(CART_COOKIE, cart.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return res;
  } catch (e) {
    return json_error(e);
  }
}
