"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  type NetworkContextValue,
  type NetworkErrorType,
  useNetworkStatus,
} from "@/hooks/use-network-status";
import { set_network_listeners } from "@/components/network/network-store";

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function useNetworkContext(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetworkContext must be used within a NetworkProvider");
  }
  return ctx;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const network = useNetworkStatus();
  const query_client = useQueryClient();

  const [backend_available, setBackendAvailable] = useState(true);
  const [pending_count, setPendingCount] = useState(0);
  const [last_error_type, setLastErrorType] = useState<NetworkErrorType | null>(null);
  const pending_ref = useRef(0);

  const mark_backend_unavailable = useCallback(() => {
    setBackendAvailable(false);
    setLastErrorType("backend_unavailable");
  }, []);

  const mark_backend_available = useCallback(() => {
    setBackendAvailable(true);
    setLastErrorType(null);
  }, []);

  const handle_timeout = useCallback(() => {
    setLastErrorType("timeout");
    network.start_slow_timer();
  }, [network.start_slow_timer]);

  const handle_request_failed = useCallback(() => {
    if (navigator.onLine) {
      setLastErrorType((prev) => prev ?? "request_failed");
    }
  }, []);

  const register_pending = useCallback(() => {
    pending_ref.current += 1;
    setPendingCount(pending_ref.current);
    return () => {
      pending_ref.current = Math.max(0, pending_ref.current - 1);
      setPendingCount(pending_ref.current);
    };
  }, []);

  const record_error = useCallback((type: NetworkErrorType) => {
    setLastErrorType(type);
  }, []);

  const clear_error = useCallback(() => {
    setLastErrorType(null);
    setBackendAvailable(true);
    network.clear_slow_timer();
  }, [network.clear_slow_timer]);

  const mark_slow = useCallback(() => {
    network.start_slow_timer();
  }, [network.start_slow_timer]);

  const mark_online = network.mark_online;

  // Register listeners with the module-level store so the tRPC link can call them
  useEffect(() => {
    set_network_listeners({
      on_timeout: handle_timeout,
      on_backend_unavailable: mark_backend_unavailable,
      on_request_failed: handle_request_failed,
    });
    return () =>
      set_network_listeners({
        on_timeout: null,
        on_backend_unavailable: null,
        on_request_failed: null,
      });
  }, [handle_timeout, mark_backend_unavailable, handle_request_failed]);

  // When coming back online, refetch stale queries
  const was_offline_ref = useRef(false);

  useEffect(() => {
    if (network.isOffline) {
      was_offline_ref.current = true;
    }

    if (network.isOnline && was_offline_ref.current) {
      was_offline_ref.current = false;
      query_client.invalidateQueries({ type: "active" });
      mark_backend_available();
      setLastErrorType(null);
    }
  }, [network.isOnline, network.isOffline, query_client, mark_backend_available]);

  // When going offline, cancel all in-flight queries
  useEffect(() => {
    if (network.isOffline) {
      query_client.cancelQueries({ type: "active" });
    }
  }, [network.isOffline, query_client]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      ...network,
      mark_slow,
      mark_online,
      backend_available,
      mark_backend_unavailable,
      mark_backend_available,
      pending_operations: pending_count,
      register_pending,
      last_error_type,
      record_error,
      clear_error,
    }),
    [
      network,
      mark_slow,
      mark_online,
      backend_available,
      mark_backend_unavailable,
      mark_backend_available,
      pending_count,
      register_pending,
      last_error_type,
      record_error,
      clear_error,
    ],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}
