import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { brand_service } from "./services/brand.service";
import { create_brand_dto, update_brand_dto, list_brands_dto } from "./models/brand.dto";

export const brand_router = create_trpc_router({
  list: permission_procedure(PERMISSIONS.products_read)
    .input(list_brands_dto)
    .query(({ input }) => brand_service.list(input)),

  active: permission_procedure(PERMISSIONS.products_read).query(() =>
    brand_service.list_active(),
  ),

  byId: permission_procedure(PERMISSIONS.products_read)
    .input(update_brand_dto.pick({ id: true }))
    .query(({ input }) => brand_service.get_by_id(input.id)),

  create: permission_procedure(PERMISSIONS.products_write)
    .input(create_brand_dto)
    .mutation(({ input }) => brand_service.create(input)),

  update: permission_procedure(PERMISSIONS.products_write)
    .input(update_brand_dto)
    .mutation(({ input }) => brand_service.update(input)),

  delete: permission_procedure(PERMISSIONS.products_write)
    .input(update_brand_dto.pick({ id: true }))
    .mutation(({ input }) => brand_service.remove(input.id)),

  stats: permission_procedure(PERMISSIONS.products_read).query(() => brand_service.stats()),
});
