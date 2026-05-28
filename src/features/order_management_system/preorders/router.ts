import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { preorder_repository } from "./repositories/preorder.repository";
import {
  upsert_preorder_settings_dto,
  list_preorder_allocations_dto,
  update_preorder_eta_dto,
} from "./models/preorder.dto";

export const preorder_router = create_trpc_router({
  getSettings: permission_procedure(PERMISSIONS.preorders_read)
    .input(z.object({ sku_id: z.string().min(1).max(255) }))
    .query(({ input }) => preorder_repository.get_settings(input.sku_id)),

  upsertSettings: permission_procedure(PERMISSIONS.preorders_write)
    .input(upsert_preorder_settings_dto)
    .mutation(({ input }) => preorder_repository.upsert_settings(input)),

  adminListAllocations: permission_procedure(PERMISSIONS.preorders_read)
    .input(list_preorder_allocations_dto)
    .query(({ input }) =>
      preorder_repository.admin_list_allocations(input.page, input.limit, input.status),
    ),

  updateEstimatedDate: permission_procedure(PERMISSIONS.preorders_write)
    .input(update_preorder_eta_dto)
    .mutation(({ input }) =>
      preorder_repository.update_estimated_date(input.allocation_id, input.estimated_available_at),
    ),
});
