import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError } from "@/lib/error_handling";
import { order_service } from "@/features/order_management_system/orders/services/order.service";
import { phoneNumberSchema } from "@/lib/validations";

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
    const guest_phone_number = url.searchParams.get("guest_phone_number");
    if (!guest_phone_number)
      throw new AuthenticationError("Connexion ou guest_phone_number requis");

    const guest_phone = phoneNumberSchema.parse(guest_phone_number);

    const data = await order_service.get_guest_detail(order_id, guest_phone);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
