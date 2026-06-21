import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { TrpcContext } from "./context";
import { app_error_formatter } from "./error-formatter";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter: app_error_formatter,
});

export const create_trpc_router = t.router;
export const t_instance = t;

export const public_procedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    await assert_ip_not_blacklisted(ctx.req);
  } catch {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Votre adresse IP a été bloquée. / Your IP address has been blocked.",
    });
  }
  return next();
});
