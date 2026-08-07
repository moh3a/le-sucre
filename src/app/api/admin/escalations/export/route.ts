import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { order_operations_service } from "@/features/order_management_system/orders/operations/services/order-operations.service";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const csv = await order_operations_service.export_escalations_csv(status);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="escalations.csv"',
    },
  });
}, PERMISSIONS.orders_read);
