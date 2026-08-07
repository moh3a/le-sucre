import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { cart_service } from "@/features/order_management_system/carts/cart.service";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const csv = await cart_service.export_csv({ search, status });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="carts.csv"',
    },
  });
}, PERMISSIONS.orders_read);
