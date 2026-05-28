import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { shipping_repository } from "@/features/shipping_management_system/repository";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const status = url.searchParams.get("status") ?? undefined;
  return shipping_repository.list_shipments(page, limit, status);
}, PERMISSIONS.orders_read);
