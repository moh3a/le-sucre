import { auth } from "@/lib/auth";
import { json_ok, json_error } from "@/lib/http";
import { AuthenticationError } from "@/lib/error_handling";
import { list_orders_dto } from "@/features/order_management_system/orders/models/order.dto";
import { order_service } from "@/features/order_management_system/orders/services/order.service";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) throw new AuthenticationError("Connexion requise");

    const url = new URL(req.url);
    const parsed = list_orders_dto.safeParse({
      page: Number(url.searchParams.get("page") ?? 1),
      limit: Number(url.searchParams.get("limit") ?? 20),
      status: url.searchParams.get("status") ?? undefined,
    });
    if (!parsed.success) throw new Error("Validation échouée");

    const data = await order_service.list_for_customer(session.user.id, parsed.data);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
