import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { app_router } from "@/lib/trpc/server";
import { create_trpc_context } from "@/lib/trpc/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: app_router,
    createContext: create_trpc_context,
  });

export { handler as GET, handler as POST };
