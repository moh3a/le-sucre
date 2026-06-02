import { TRPCError } from "@trpc/server";

import { public_procedure } from "@/lib/trpc/router";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { tryFn } from "@/lib/error_handling";

const authz = new AuthorizationService();

export const protected_procedure = public_procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

export const admin_procedure = protected_procedure.use(async ({ ctx, next }) => {
  const [error] = await tryFn(authz.assert_admin_console(ctx.user.id));
  if (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: error.message,
    });
  }
  const rbac = await authz.get_auth_context(ctx.user.id);
  return next({ ctx: { ...ctx, rbac } });
});

export const permission_procedure = (permission: string) =>
  admin_procedure.use(async ({ ctx, next }) => {
    const [error] = await tryFn(authz.assert_permission(ctx.user.id, permission));

    if (error)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: error.message,
      });
    return next({ ctx });
  });

export const storefront_procedure = protected_procedure.use(async ({ ctx, next }) => {
  const [error] = await tryFn(authz.assert_customer(ctx.user.id));
  if (error)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: error.message,
    });
  return next({ ctx });
});
