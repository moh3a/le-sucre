import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { shipping_service } from "@/features/shipping_management_system/services/shipping.service";

type RouteContext = { params: Promise<{ shipment_id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const { shipment_id } = await context.params;
  return admin_route(
    async () => shipping_service.sync_tracking(shipment_id),
    PERMISSIONS.orders_write,
  )(req);
}
