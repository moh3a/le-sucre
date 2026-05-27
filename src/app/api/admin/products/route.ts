import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { product_service } from "@/features/product_information_management/products/services/product.service";
import { validate_create_product, validate_list_products } from "@/features/product_information_management/products/validators/product.validators";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const input = validate_list_products({
    page: Number(url.searchParams.get("page") ?? 1),
    limit: Number(url.searchParams.get("limit") ?? 20),
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    brand_id: url.searchParams.get("brand_id") ?? undefined,
    category_id: url.searchParams.get("category_id") ?? undefined,
  });
  return product_service.list(input);
}, PERMISSIONS.products_read);

export const POST = admin_route(async ({ req }) => {
  const body = await req.json();
  const input = validate_create_product(body);
  return product_service.create(input);
}, PERMISSIONS.products_write);
