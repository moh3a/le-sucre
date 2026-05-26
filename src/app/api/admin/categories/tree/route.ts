import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { category_service } from "@/features/product_information_management/categories/services/category.service";

export const GET = admin_route(
  async () => category_service.get_full_tree(false),
  PERMISSIONS.categories_read,
);

// TODO: POST create (JSON body)
