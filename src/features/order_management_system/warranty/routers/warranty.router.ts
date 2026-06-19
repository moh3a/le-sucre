import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { warranty_service } from "../services/warranty.service";

export const warranty_router = create_trpc_router({
  warrantyCreate: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), order_item_id: z.string().optional(), product_id: z.string(), sku_id: z.string(), user_id: z.string().optional(), issue_type: z.string(), description: z.string(), technician_user_id: z.string().optional() }))
    .mutation(({ ctx, input }) => warranty_service.create({ ...input, user_id: input.user_id ?? ctx.session!.user.id })),

  warrantyReview: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), status: z.enum(["approved", "rejected", "under_review"]), technician_user_id: z.string().optional(), technician_notes: z.string().optional() }))
    .mutation(({ ctx, input }) => warranty_service.review({ ...input, reviewed_by_user_id: ctx.session!.user.id })),

  warrantyResolve: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), resolution_type: z.enum(["repair", "replace", "refund", "none"]), resolution_notes: z.string().optional() }))
    .mutation(({ ctx, input }) => warranty_service.resolve({ ...input, resolved_by_user_id: ctx.session!.user.id })),

  warrantyGet: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => warranty_service.get(input.id)),

  warrantyListByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => warranty_service.list_by_order(input.order_id)),

  warrantyList: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => warranty_service.list(input.page, input.limit, input.status)),

  warrantyStats: permission_procedure(PERMISSIONS.orders_read)
    .query(() => warranty_service.stats()),
});
