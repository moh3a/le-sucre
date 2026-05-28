import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { shipping_service } from "@/features/shipping_management_system/services/shipping.service";

type RouteContext = { params: Promise<{ order_id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const { order_id } = await context.params;
  return admin_route(async ({ req: request }) => {
    const body = await request.json().catch(() => ({}));
    return shipping_service.create_for_order({
      order_id,
      provider: body.provider ?? "yalidine",
      weight_kg: Number(body.weight_kg ?? 0.5),
    });
  }, PERMISSIONS.orders_write)(req);
}
