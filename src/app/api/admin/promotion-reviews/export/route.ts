import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { promotion_review_service } from "@/features/order_management_system/promotions/operations/services/promotion-review.service";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const csv = await promotion_review_service.export_csv(status);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="promotion-reviews.csv"',
    },
  });
}, PERMISSIONS.promotions_read);
