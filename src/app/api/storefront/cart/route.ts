import { json_ok, json_error } from "@/lib/http";
import {
  get_storefront_identity,
  CART_COOKIE,
} from "@/features/order_management_system/carts/cart-context.helper";
import { cart_service } from "@/features/order_management_system/carts/cart.service";

export async function GET(req: Request) {
  try {
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
