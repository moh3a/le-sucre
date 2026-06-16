import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { TrpcContext } from "./context";
import { app_error_formatter } from "./error-formatter";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter: app_error_formatter,
});

export const create_trpc_router = t.router;
export const public_procedure = t.procedure;
