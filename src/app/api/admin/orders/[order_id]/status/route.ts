import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { admin_update_order_status_dto } from "@/features/order_management_system/orders/models/order.dto";
import { order_service } from "@/features/order_management_system/orders/order.service";

type RouteContext = { params: Promise<{ order_id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const { order_id } = await context.params;

  return admin_route(async ({ req: request, user }) => {
    const body = await request.json();
    const parsed = admin_update_order_status_dto.safeParse({
      ...body,
      order_id,
    });
    if (!parsed.success) throw new Error("Validation échouée");

    return order_service.transition_status({
      ...parsed.data,
      actor_user_id: user.id,
    });
  }, PERMISSIONS.orders_write)(req);
}
