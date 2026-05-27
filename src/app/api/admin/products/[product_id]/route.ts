import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { product_service } from "@/features/product_information_management/products/services/product.service";
import { validate_update_product } from "@/features/product_information_management/products/validators/product.validators";

type RouteContext = { params: Promise<{ product_id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { product_id } = await context.params;
  return admin_route(async () => product_service.get_by_id(product_id), PERMISSIONS.products_read)(
    _req,
  );
}

export async function PATCH(req: Request, context: RouteContext) {
  const { product_id } = await context.params;
  return admin_route(async ({ req: request }) => {
    const body = await request.json();
    const input = validate_update_product({ ...body, id: product_id });
    return product_service.update(input);
  }, PERMISSIONS.products_write)(req);
}

export async function DELETE(req: Request, context: RouteContext) {
  const { product_id } = await context.params;
  return admin_route(async () => product_service.remove(product_id), PERMISSIONS.products_write)(req);
}
