import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

import {
  sku_id_dto,
  product_id_dto,
  adjust_stock_dto,
  set_stock_dto,
  receive_stock_dto,
  list_movements_dto,
  create_reservation_dto,
  reservation_id_dto,
  commit_reservation_dto,
} from "./models/inventory.dto";
import { inventory_service } from "./services/inventory.service";
import { reservation_service } from "./services/reservation.service";

export const inventory_router = create_trpc_router({
  getLevel: permission_procedure(PERMISSIONS.inventory_read)
    .input(sku_id_dto)
    .query(({ input }) => inventory_service.get_level(input.sku_id, input.warehouse_id)),

  listByProduct: permission_procedure(PERMISSIONS.inventory_read)
    .input(product_id_dto)
    .query(({ input }) => inventory_service.list_by_product(input.product_id, input.warehouse_id)),

  listMovements: permission_procedure(PERMISSIONS.inventory_read)
    .input(list_movements_dto)
    .query(({ input }) => inventory_service.list_movements(input)),

  adjustStock: permission_procedure(PERMISSIONS.inventory_write)
    .input(adjust_stock_dto)
    .mutation(({ input }) => inventory_service.adjust_stock(input)),

  setStock: permission_procedure(PERMISSIONS.inventory_write)
    .input(set_stock_dto)
    .mutation(({ input }) => inventory_service.set_stock(input)),

  receiveStock: permission_procedure(PERMISSIONS.inventory_write)
    .input(receive_stock_dto)
    .mutation(({ input }) => inventory_service.receive_stock(input)),

  createReservation: permission_procedure(PERMISSIONS.inventory_write)
    .input(create_reservation_dto)
    .mutation(({ input }) => reservation_service.create(input)),

  releaseReservation: permission_procedure(PERMISSIONS.inventory_write)
    .input(reservation_id_dto)
    .mutation(({ input }) => reservation_service.release(input.id)),

  commitReservation: permission_procedure(PERMISSIONS.inventory_write)
    .input(commit_reservation_dto)
    .mutation(({ input }) => reservation_service.commit(input)),

  expireStaleReservations: permission_procedure(PERMISSIONS.inventory_write).mutation(() =>
    reservation_service.expire_stale(),
  ),

  adminDashboard: permission_procedure(PERMISSIONS.inventory_read).query(async () => ({
    total_stock_value: await inventory_admin_repository.stock_value(),
    out_of_stock: await inventory_admin_repository.count_out_of_stock(),
    low_stock: await inventory_admin_repository.count_low_stock(),
    forecast_shortages: await forecast_repository.count_high_risk(),
  })),
});
