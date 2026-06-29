import { json_ok, json_error } from "@/lib/http";
import { place_order_dto } from "@/features/order_management_system/orders/models/order.dto";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { checkout_service } from "@/features/order_management_system/checkout/checkout.service";
import { ValidationError, RateLimitError } from "@/lib/error_handling";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";
import { assert_content_type } from "@/lib/security/validation";
import { sanitize_json } from "@/lib/security/sanitization";

export async function POST(req: Request) {
  try {
    await assert_ip_not_blacklisted(req);
    assert_content_type(req, ["application/json"]);

    const ip = getClientIp(req.headers);
    const rl = await rateLimit(ip, RATE_LIMITS.checkout);
    if (!rl.success) throw new RateLimitError();

    const identity = await get_storefront_identity(req.headers);
    if (!identity.cart_id) throw new ValidationError("Panier introuvable");

    const body = sanitize_json(await req.json());
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
