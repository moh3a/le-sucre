import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

import { create_warehouse_dto, list_warehouses_dto, update_warehouse_dto, warehouse_id_dto } from "./models/warehouse.dto";
import { warehouse_service } from "./services/warehouse.service";

export const warehouse_router = create_trpc_router({
  list: permission_procedure(PERMISSIONS.inventory_read)
    .input(list_warehouses_dto)
    .query(({ input }) => warehouse_service.list(input)),

  getById: permission_procedure(PERMISSIONS.inventory_read)
    .input(warehouse_id_dto)
    .query(({ input }) => warehouse_service.get_by_id(input)),

  listAllActive: permission_procedure(PERMISSIONS.inventory_read).query(() =>
    warehouse_service.list_all_active(),
  ),

  create: permission_procedure(PERMISSIONS.inventory_write)
    .input(create_warehouse_dto)
    .mutation(({ input }) => warehouse_service.create(input)),

  update: permission_procedure(PERMISSIONS.inventory_write)
    .input(update_warehouse_dto)
    .mutation(({ input }) => warehouse_service.update(input)),
});
