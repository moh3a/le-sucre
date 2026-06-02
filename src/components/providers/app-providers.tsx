"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import { useState } from "react";

import type { AppRouter } from "@/lib/trpc/server";

export const trpc = createTRPCReact<AppRouter>({
  abortOnUnmount: true,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(() => new QueryClient());
  const [trpc_client] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
        loggerLink({
          // enabled: (opts) =>
          //   process.env.NODE_ENV === "development" ||
          //   (opts.direction === "down" && opts.result instanceof Error),
          enabled: () => true,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpc_client} queryClient={query_client}>
      <QueryClientProvider client={query_client}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
