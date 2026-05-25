import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

export const create_trpc_router = t.router;
export const public_procedure = t.procedure;
