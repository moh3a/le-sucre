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

function create_query_client() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(create_query_client);
  const [trpc_client] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
        loggerLink({
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
