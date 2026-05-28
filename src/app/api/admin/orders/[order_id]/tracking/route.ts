import { json_ok, json_error } from "@/lib/http";
import { shipping_service } from "@/features/shipping_management_system/services/shipping.service";

type RouteContext = { params: Promise<{ order_id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { order_id } = await context.params;
    const data = await shipping_service.tracking_by_order(order_id);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
