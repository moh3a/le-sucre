"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import { useState } from "react";

import type { AppRouter } from "@/lib/trpc/server";
import { NetworkProvider } from "@/components/network/network-provider";
import { ConnectionBanner } from "@/components/network/connection-banner";
import { create_network_link } from "@/components/network/network-aware-link";
import { get_network_listeners } from "@/components/network/network-store";

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
        networkMode: "online",
      },
      mutations: {
        retry: false,
        networkMode: "online",
      },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(create_query_client);
  const [trpc_client] = useState(() =>
    trpc.createClient({
      links: [
        create_network_link({
          timeout_ms: 30_000,
          on_timeout: () => get_network_listeners().on_timeout?.(),
          on_backend_unavailable: () =>
            get_network_listeners().on_backend_unavailable?.(),
          on_request_failed: () => get_network_listeners().on_request_failed?.(),
        }),
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
      <QueryClientProvider client={query_client}>
        <NetworkProvider>
          <ConnectionBanner />
          {children}
        </NetworkProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
