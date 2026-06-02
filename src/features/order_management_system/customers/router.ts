import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { customer_service } from "./services/customer.service";

export const customers_router = create_trpc_router({
  adminList: permission_procedure(PERMISSIONS.customers_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => customer_service.list(input.page, input.limit)),

  adminGet: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string().min(1) }))
    .query(({ input }) => customer_service.get(input.user_id)),

  adminStats: permission_procedure(PERMISSIONS.customers_read).query(() =>
    customer_service.stats(),
  ),
});
