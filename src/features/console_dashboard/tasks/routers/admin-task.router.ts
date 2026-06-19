import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { admin_task_service } from "../services/admin-task.service";

export const admin_task_router = create_trpc_router({
  adminTaskCreate: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ task_type: z.enum(["order_follow_up", "customer_follow_up", "inventory_review", "campaign_review", "general"]), title: z.string().min(1).max(255), description: z.string().optional(), reference_type: z.string().optional(), reference_id: z.string().optional(), assigned_to_user_id: z.string().optional(), priority: z.enum(["low", "normal", "high", "urgent"]).optional(), due_at: z.string().optional() }))
    .mutation(({ ctx, input }) => admin_task_service.create({ ...input, created_by_user_id: ctx.session!.user.id })),

  adminTaskUpdate: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string(), title: z.string().optional(), description: z.string().optional(), priority: z.enum(["low", "normal", "high", "urgent"]).optional(), due_at: z.string().optional(), assigned_to_user_id: z.string().optional() }))
    .mutation(({ ctx, input }) => admin_task_service.update({ ...input, updated_by_user_id: ctx.session!.user.id })),

  adminTaskAssign: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string(), assigned_to_user_id: z.string() }))
    .mutation(({ ctx, input }) => admin_task_service.assign({ ...input, assigned_by_user_id: ctx.session!.user.id })),

  adminTaskStart: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => admin_task_service.start_task({ ...input, user_id: ctx.session!.user.id })),

  adminTaskComplete: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string(), completion_notes: z.string().optional() }))
    .mutation(({ ctx, input }) => admin_task_service.complete({ ...input, completed_by_user_id: ctx.session!.user.id })),

  adminTaskCancel: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => admin_task_service.cancel({ ...input, cancelled_by_user_id: ctx.session!.user.id })),

  adminTaskGet: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => admin_task_service.get(input.id)),

  adminTaskListMine: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ status: z.string().optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ ctx, input }) => admin_task_service.list_for_user(ctx.session!.user.id, input.status, input.page, input.limit)),

  adminTaskListAll: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ status: z.string().optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ input }) => admin_task_service.list_all(input.status, input.page, input.limit)),

  adminTaskGetOverdue: permission_procedure(PERMISSIONS.settings_read)
    .query(() => admin_task_service.get_overdue()),

  adminTaskDashboard: permission_procedure(PERMISSIONS.settings_read)
    .query(({ ctx }) => admin_task_service.get_dashboard_stats(ctx.session!.user.id)),
});
