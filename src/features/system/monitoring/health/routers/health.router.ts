import { create_trpc_router } from "@/lib/trpc/router";
import { admin_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { get_health_status } from "@/lib/monitoring/health";

export const health_router = create_trpc_router({
  check: admin_procedure.query(async () => {
    return get_health_status();
  }),
});
