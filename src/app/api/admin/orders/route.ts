import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { list_orders_dto } from "@/features/order_management_system/orders/models/order.dto";
import { order_service } from "@/features/order_management_system/orders/order.service";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const parsed = list_orders_dto.safeParse({
    page: Number(url.searchParams.get("page") ?? 1),
    limit: Number(url.searchParams.get("limit") ?? 20),
    status: url.searchParams.get("status") ?? undefined,
  });
  if (!parsed.success) throw new Error("Validation échouée");
  return order_service.admin_list(parsed.data);
}, PERMISSIONS.orders_read);
