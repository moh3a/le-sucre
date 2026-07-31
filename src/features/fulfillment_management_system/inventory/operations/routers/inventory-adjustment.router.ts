import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { inventory_adjustment_service } from "../services/inventory-adjustment.service";

export const inventory_adjustment_router = create_trpc_router({
  inventoryRequestAdjustment: permission_procedure(PERMISSIONS.inventory_write)
    .input(z.object({ sku_id: z.string(), warehouse_id: z.string().optional(), adjustment_type: z.enum(["increase", "decrease", "damage", "loss", "correction"]), quantity_delta: z.coerce.number().int(), current_on_hand: z.coerce.number().int(), expected_on_hand: z.coerce.number().int(), reason: z.string().min(1) }))
    .mutation(({ ctx, input }) => inventory_adjustment_service.request_adjustment({ ...input, requested_by_user_id: ctx.session!.user.id })),

  inventoryReviewAdjustment: permission_procedure(PERMISSIONS.inventory_write)
    .input(z.object({ id: z.string(), status: z.enum(["approved", "rejected", "cancelled"]), review_note: z.string().optional() }))
    .mutation(({ ctx, input }) => inventory_adjustment_service.review({ ...input, reviewed_by_user_id: ctx.session!.user.id })),

  inventoryListAdjustmentRequests: permission_procedure(PERMISSIONS.inventory_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => inventory_adjustment_service.list(input.page, input.limit, input.status)),

  inventoryAdjustmentStats: permission_procedure(PERMISSIONS.inventory_read)
    .query(() => inventory_adjustment_service.stats()),
});
