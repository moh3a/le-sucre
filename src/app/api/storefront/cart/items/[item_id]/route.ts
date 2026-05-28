import { json_ok, json_error } from "@/lib/http";
import { ValidationError } from "@/lib/error_handling";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { update_cart_item_dto } from "@/features/order_management_system/carts/models/cart.dto";
import { cart_service } from "@/features/order_management_system/carts/cart.service";

type RouteContext = { params: Promise<{ item_id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { item_id } = await context.params;
    const identity = await get_storefront_identity(req.headers);
    if (!identity.cart_id) throw new ValidationError("Panier introuvable");

    const body = await req.json();
    const parsed = update_cart_item_dto.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation échouée");

    const data = await cart_service.update_quantity(identity.cart_id, item_id, parsed.data);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { item_id } = await context.params;
    const identity = await get_storefront_identity(req.headers);
    if (!identity.cart_id) throw new ValidationError("Panier introuvable");

    const data = await cart_service.remove_item(identity.cart_id, item_id);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
