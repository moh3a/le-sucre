import { create_trpc_router } from "@/lib/trpc/router";
import { protected_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { dashboard_service } from "../services/dashboard.service";

export const dashboard_router = create_trpc_router({
  getSummary: protected_procedure.query(async ({ ctx }) => {
    return dashboard_service.get_summary(ctx.user);
  }),
});
