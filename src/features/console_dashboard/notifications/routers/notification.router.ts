import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { notification_service } from "../services/notification.service";

export const notification_router = create_trpc_router({
  notificationList: storefront_procedure
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), unread_only: z.boolean().default(false) }))
    .query(({ ctx, input }) => notification_service.list(ctx.session!.user.id, input.page, input.limit, input.unread_only)),

  notificationMarkAsRead: storefront_procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => notification_service.mark_as_read(input.id, ctx.session!.user.id)),

  notificationMarkAllAsRead: storefront_procedure
    .mutation(({ ctx }) => notification_service.mark_all_as_read(ctx.session!.user.id)),

  notificationCountUnread: storefront_procedure
    .query(({ ctx }) => notification_service.count_unread(ctx.session!.user.id)),
});
