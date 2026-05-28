import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError, ValidationError } from "@/lib/error_handling";
import { order_service } from "@/features/order_management_system/orders/order.service";

type RouteContext = { params: Promise<{ order_id: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const { order_id } = await context.params;
    const session = await auth.api.getSession({ headers: req.headers });

    if (session?.user) {
      const data = await order_service.get_customer_detail(order_id, session.user.id);
      return json_ok(data);
    }

    const url = new URL(req.url);
    const guest_email = url.searchParams.get("guest_email");
    if (!guest_email) throw new AuthenticationError("Connexion ou guest_email requis");

    if (!guest_email.includes("@")) throw new ValidationError("guest_email invalide");

    const data = await order_service.get_guest_detail(order_id, guest_email);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
