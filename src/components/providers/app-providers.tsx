"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import { useState } from "react";

import type { AppRouter } from "@/lib/trpc/server";

export const trpc = createTRPCReact<AppRouter>();

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(() => new QueryClient());
  const [trpc_client] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
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
