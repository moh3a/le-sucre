import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { ip_blacklist_service } from "@/features/ip_blacklist/services/blacklist.service";
import { BLACKLIST_PERMISSIONS } from "@/features/ip_blacklist/constants";
import {
  add_to_blacklist_schema,
  update_blacklist_schema,
  list_blacklist_schema,
} from "@/features/ip_blacklist/validators/blacklist.validator";

export const blacklist_router = create_trpc_router({
  stats: permission_procedure(BLACKLIST_PERMISSIONS.view).query(async () => {
    return ip_blacklist_service.stats();
  }),

  list: permission_procedure(BLACKLIST_PERMISSIONS.view).input(list_blacklist_schema).query(async ({ input }) => {
    return ip_blacklist_service.list(input);
  }),

  get_by_id: permission_procedure(BLACKLIST_PERMISSIONS.view).input(z.object({ id: z.string() })).query(async ({ input }) => {
    return ip_blacklist_service.get_by_id(input.id);
  }),

  add: permission_procedure(BLACKLIST_PERMISSIONS.create).input(add_to_blacklist_schema).mutation(async ({ ctx, input }) => {
    return ip_blacklist_service.add({
      ...input,
      created_by: ctx.user.id,
    });
  }),

  update: permission_procedure(BLACKLIST_PERMISSIONS.update).input(
    z.object({ id: z.string(), data: update_blacklist_schema }),
  ).mutation(async ({ input }) => {
    return ip_blacklist_service.update(input.id, input.data);
  }),

  remove: permission_procedure(BLACKLIST_PERMISSIONS.delete).input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await ip_blacklist_service.remove(input.id);
    return { success: true };
  }),

  toggle: permission_procedure(BLACKLIST_PERMISSIONS.update).input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return ip_blacklist_service.toggle(input.id);
  }),

  check: public_procedure.input(z.object({ ip: z.string() })).query(async ({ input }) => {
    const blocked = await ip_blacklist_service.is_blacklisted(input.ip);
    return { blocked };
  }),
});
