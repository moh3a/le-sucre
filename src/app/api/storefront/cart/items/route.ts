import { json_ok, json_error } from "@/lib/http";
import { ValidationError } from "@/lib/error_handling";
import {
  get_storefront_identity,
  CART_COOKIE,
} from "@/features/order_management_system/carts/cart-context.helper";
import { add_cart_item_dto } from "@/features/order_management_system/carts/models/cart.dto";
import { cart_service } from "@/features/order_management_system/carts/cart.service";

export async function POST(req: Request) {
  try {
    const identity = await get_storefront_identity(req.headers);
    const body = await req.json();
    const parsed = add_cart_item_dto.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation échouée");

    const cart = await cart_service.get_or_create_cart({
      user_id: identity.user_id,
      cart_id: identity.cart_id,
      guest_token: identity.new_guest_token ?? undefined,
    });

    const view = await cart_service.add_item(cart.id, parsed.data);
    const res = json_ok(view, 201);

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
