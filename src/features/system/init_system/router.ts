import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { z } from "zod";
import { init_service } from "./services/init.service";

export const init_router = create_trpc_router({
  status: public_procedure.query(async () => {
    return init_service.check_status();
  }),

  runMigrations: public_procedure.mutation(async () => {
    await init_service.run_migrations();
    return { ok: true };
  }),

  seedRbac: public_procedure.mutation(async () => {
    await init_service.seed_roles_and_permissions();
    return { ok: true };
  }),

  createAdmin: public_procedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email(),
        password: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ input }) => {
      return init_service.create_admin(input);
    }),

  complete: public_procedure
    .input(z.object({ admin_user_id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await init_service.complete(input.admin_user_id);
      return { ok: true };
    }),

  ensureStatus: public_procedure
    .input(z.object({ admin_user_id: z.string().optional() }))
    .mutation(async ({ input }) => {
      await init_service.ensure_status_entry(input.admin_user_id);
      return { ok: true };
    }),

  adminExists: public_procedure.query(async () => {
    return init_service.find_first_admin();
  }),
});
