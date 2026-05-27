import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { validate_create_category } from "@/features/product_information_management/categories/validators/category.validators";

export const GET = admin_route(
  async () => category_service.get_full_tree(false),
  PERMISSIONS.categories_read,
);

export const POST = admin_route(async ({ req }) => {
  const body = await req.json();
  const input = validate_create_category(body);
  return category_service.create(input);
}, PERMISSIONS.categories_write);
