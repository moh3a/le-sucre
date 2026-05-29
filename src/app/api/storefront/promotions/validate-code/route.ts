import { json_ok, json_error } from "@/lib/http";
import { validate_promo_code_dto } from "@/features/order_management_system/promotions/models/promotion.dto";
import { cart_discount_service } from "@/features/order_management_system/promotions/services/cart-discount.service";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = validate_promo_code_dto.safeParse(body);
    if (!parsed.success) throw new Error("Validation échouée");

    const identity = await get_storefront_identity(req.headers);
    const data = await cart_discount_service.apply({
      lines: parsed.data.lines,
      promo_code: parsed.data.code,
      shipping_cost: parsed.data.shipping_cost,
      user_id: identity.user_id ?? null,
    });

    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
