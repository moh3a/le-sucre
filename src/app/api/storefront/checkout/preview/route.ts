import { json_ok, json_error } from "@/lib/http";
import { checkout_preview_dto } from "@/features/order_management_system/orders/models/order.dto";
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
    if (!identity.cart_id) {
      return json_ok({
        cart_id: null,
        items_count: 0,
        totals: {
          subtotal: "0.00",
          discount_total: "0.00",
          tax_total: "0.00",
          shipping_total: "0.00",
          grand_total: "0.00",
          adjustments: [],
        },
      });
    }

    const body = sanitize_json(await req.json());
    const parsed = checkout_preview_dto.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation échouée");
    }

    const data = await checkout_service.preview({
      ...parsed.data,
      cart_id: identity.cart_id,
      user_id: identity.user_id ?? null,
    });

    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
