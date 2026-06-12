import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { category_service } from "./services/category.service";
import {
  create_category_dto,
  update_category_dto,
  move_category_dto,
  list_categories_dto,
  filter_by_category_dto,
} from "./models/category.dto";

export const category_router = create_trpc_router({
  tree: permission_procedure(PERMISSIONS.categories_read).query(() =>
    category_service.get_full_tree(false),
  ),

  list: permission_procedure(PERMISSIONS.categories_read)
    .input(list_categories_dto)
    .query(({ input }) => category_service.list_flat(input)),

  byId: permission_procedure(PERMISSIONS.categories_read)
    .input(update_category_dto.pick({ id: true }))
    .query(({ input }) => category_service.find_by_id(input.id)),

  ancestors: permission_procedure(PERMISSIONS.categories_read)
    .input(update_category_dto.pick({ id: true }))
    .query(({ input }) => category_service.get_ancestors(input.id)),

  descendants: permission_procedure(PERMISSIONS.categories_read)
    .input(filter_by_category_dto)
    .query(({ input }) => category_service.get_descendants(input.category_id, true)),

  create: permission_procedure(PERMISSIONS.categories_write)
    .input(create_category_dto)
    .mutation(({ input }) => category_service.create(input)),

  update: permission_procedure(PERMISSIONS.categories_write)
    .input(update_category_dto)
    .mutation(({ input }) => category_service.update(input)),

  move: permission_procedure(PERMISSIONS.categories_write)
    .input(move_category_dto)
    .mutation(({ input }) => category_service.move(input.id, input.new_parent_id)),

  delete: permission_procedure(PERMISSIONS.categories_write)
    .input(update_category_dto.pick({ id: true }))
    .mutation(({ input }) => category_service.remove(input.id)),

  stats: permission_procedure(PERMISSIONS.categories_read)
    .query(() => category_service.get_stats()),
});
