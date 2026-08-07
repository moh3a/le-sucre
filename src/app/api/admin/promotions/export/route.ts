import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { promotion_repository } from "@/features/order_management_system/promotions/repositories/promotion.repository";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const promotion_type = url.searchParams.get("promotion_type") ?? undefined;
  const csv = await promotion_repository.export_csv({ search, status, promotion_type });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="promotions.csv"',
    },
  });
}, PERMISSIONS.promotions_read);
