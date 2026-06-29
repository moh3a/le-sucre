import { json_ok, json_error } from "@/lib/http";
import { ValidationError, RateLimitError } from "@/lib/error_handling";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { update_cart_item_dto } from "@/features/order_management_system/carts/models/cart.dto";
import { cart_service } from "@/features/order_management_system/carts/cart.service";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { assert_content_type } from "@/lib/security/validation";
import { sanitize_json } from "@/lib/security/sanitization";
import { z } from "zod";

type RouteContext = { params: Promise<{ item_id: string }> };

const itemIdSchema = z.string().min(1, { message: "Invalid item ID" });

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await assert_ip_not_blacklisted(req);
    assert_content_type(req, ["application/json"]);

    const ip = getClientIp(req.headers);
    const rl = await rateLimit(ip, RATE_LIMITS.cartAdd);
    if (!rl.success) throw new RateLimitError();

    const { item_id } = await context.params;
    itemIdSchema.parse(item_id);

    const identity = await get_storefront_identity(req.headers);
    if (!identity.cart_id) throw new ValidationError("Panier introuvable");

    const body = sanitize_json(await req.json());
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
    await assert_ip_not_blacklisted(req);

    const ip = getClientIp(req.headers);
    const rl = await rateLimit(ip, RATE_LIMITS.cartAdd);
    if (!rl.success) throw new RateLimitError();

    const { item_id } = await context.params;
    itemIdSchema.parse(item_id);

    const identity = await get_storefront_identity(req.headers);
    if (!identity.cart_id) throw new ValidationError("Panier introuvable");

    const data = await cart_service.remove_item(identity.cart_id, item_id);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
