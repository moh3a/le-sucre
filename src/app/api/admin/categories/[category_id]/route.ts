import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import {
  validate_update_category,
  validate_move_category,
} from "@/features/product_information_management/categories/validators/category.validators";

type RouteContext = { params: Promise<{ category_id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { category_id } = await context.params;
  return admin_route(
    async () => category_service.find_by_id(category_id),
    PERMISSIONS.categories_read,
  )(req);
}

export async function PATCH(req: Request, context: RouteContext) {
  const { category_id } = await context.params;

  return admin_route(async ({ req: request }) => {
    const body = await request.json();

    // allow { parent_id } to trigger move
    if (Object.prototype.hasOwnProperty.call(body, "new_parent_id")) {
      const move = validate_move_category({
        id: category_id,
        new_parent_id: body.new_parent_id ?? null,
      });
      return category_service.move(move.id, move.new_parent_id);
    }

    const input = validate_update_category({ ...body, id: category_id });
    return category_service.update(input);
  }, PERMISSIONS.categories_write)(req);
}

export async function DELETE(req: Request, context: RouteContext) {
  const { category_id } = await context.params;
  return admin_route(
    async () => category_service.remove(category_id),
    PERMISSIONS.categories_write,
  )(req);
}
