import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import { protected_procedure, permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { profile_service } from "@/features/authentication_and_authorization/profile/services/profile.service";
import {
  update_profile_schema,
  initialize_profile_schema,
  create_address_schema,
  update_address_schema,
  set_default_address_schema,
} from "@/features/authentication_and_authorization/profile/validators/profile.validators";

export const profile_router = create_trpc_router({
  // ─── Profile ──────────────────────────────────────────────────
  get: protected_procedure.query(async ({ ctx }) => {
    return profile_service.get_profile(ctx.user.id);
  }),

  initialize: protected_procedure
    .input(initialize_profile_schema)
    .mutation(async ({ ctx, input }) => {
      return profile_service.initialize_profile(ctx.user.id, input);
    }),

  update: protected_procedure
    .input(update_profile_schema)
    .mutation(async ({ ctx, input }) => {
      return profile_service.update_profile(ctx.user.id, input);
    }),

  // ─── Addresses ────────────────────────────────────────────────
  listAddresses: protected_procedure.query(async ({ ctx }) => {
    const profile = await profile_service.get_profile(ctx.user.id);
    return profile.addresses;
  }),

  createAddress: protected_procedure
    .input(create_address_schema)
    .mutation(async ({ ctx, input }) => {
      return profile_service.create_address(ctx.user.id, input);
    }),

  updateAddress: protected_procedure
    .input(update_address_schema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return profile_service.update_address(ctx.user.id, id, data);
    }),

  deleteAddress: protected_procedure
    .input(z.object({ address_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return profile_service.delete_address(ctx.user.id, input.address_id);
    }),

  setDefaultAddress: protected_procedure
    .input(set_default_address_schema)
    .mutation(async ({ ctx, input }) => {
      return profile_service.set_default_address(
        ctx.user.id,
        input.address_id,
        input.type,
      );
    }),
});

export const admin_profile_router = create_trpc_router({
  getByUserId: permission_procedure(PERMISSIONS.users_read)
    .input(z.object({ user_id: z.string().min(1) }))
    .query(async ({ input }) => {
      return profile_service.get_profile(input.user_id);
    }),
});
