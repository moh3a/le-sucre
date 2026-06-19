import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { product_workflow_service } from "../services/product-workflow.service";

export const product_workflow_router = create_trpc_router({
  productGetChangeLog: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ product_id: z.string(), change_type: z.string().optional() }))
    .query(({ input }) => product_workflow_service.get_change_history(input.product_id, input.change_type)),

  productSchedulePublish: permission_procedure(PERMISSIONS.products_write)
    .input(z.object({ product_id: z.string(), action: z.enum(["publish", "unpublish"]), scheduled_at: z.string() }))
    .mutation(({ ctx, input }) => product_workflow_service.schedule_publishing({ ...input, created_by_user_id: ctx.session!.user.id })),

  productCancelSchedule: permission_procedure(PERMISSIONS.products_write)
    .input(z.object({ schedule_id: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) => product_workflow_service.cancel_schedule({ ...input, cancelled_by_user_id: ctx.session!.user.id })),

  productGetScheduledActions: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ product_id: z.string().optional() }))
    .query(({ input }) => product_workflow_service.get_scheduled_actions(input.product_id)),

  productListScheduledActions: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => product_workflow_service.list_scheduled_actions(input.page, input.limit, input.status)),

  productGetScheduleStats: permission_procedure(PERMISSIONS.products_read)
    .query(() => product_workflow_service.get_schedule_stats()),
});
