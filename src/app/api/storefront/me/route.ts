import { json_ok, json_error } from "@/lib/http";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";

export async function GET(req: Request) {
  try {
    const identity = await get_storefront_identity(req.headers);
    if (!identity.user_id) {
      return json_ok({ user: null, roles: [], permissions: [] });
    }

    const authz = new AuthorizationService();
    const rbac = await authz.get_auth_context(identity.user_id);

    return json_ok({
      user_id: identity.user_id,
      email: identity.email,
      ...rbac,
    });
  } catch (e) {
    return json_error(e);
  }
}
