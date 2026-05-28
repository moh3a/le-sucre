import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { order_service } from "@/features/order_management_system/orders/order.service";

type RouteContext = { params: Promise<{ order_id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { order_id } = await context.params;
  return admin_route(async () => order_service.admin_get(order_id), PERMISSIONS.orders_read)(req);
}
