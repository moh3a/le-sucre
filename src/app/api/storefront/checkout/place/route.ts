import { json_ok, json_error } from "@/lib/http";
import { place_order_dto } from "@/features/order_management_system/orders/models/order.dto";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { checkout_service } from "@/features/order_management_system/checkout/checkout.service";
import { ValidationError } from "@/lib/error_handling";

export async function POST(req: Request) {
  try {
    const identity = await get_storefront_identity(req.headers);
    if (!identity.cart_id) throw new ValidationError("Panier introuvable");

    const body = await req.json();
    const parsed = place_order_dto.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation échouée");

    const idempotency = req.headers.get("Idempotency-Key") ?? parsed.data.idempotency_key;
    if (!idempotency) throw new ValidationError("Idempotency-Key requis");

    const data = await checkout_service.place({
      ...parsed.data,
      idempotency_key: idempotency,
      cart_id: identity.cart_id,
      user_id: identity.user_id ?? null,
    });

    return json_ok(data, 201);
  } catch (e) {
    return json_error(e);
  }
}
