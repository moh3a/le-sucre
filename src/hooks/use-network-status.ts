"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NetworkStatus = "online" | "offline" | "slow";

export interface NetworkState {
  status: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  isSlow: boolean;
  lastOfflineAt: number | null;
  lastOnlineAt: number | null;
  slowThresholdMs: number;
}

const DEFAULT_SLOW_THRESHOLD_MS = 5_000;

function detect_initial_status(): NetworkStatus {
  if (typeof navigator === "undefined") return "online";
  if (!navigator.onLine) return "offline";
  return "online";
}

export function useNetworkStatus(slowThresholdMs = DEFAULT_SLOW_THRESHOLD_MS): NetworkState {
  const [status, setStatus] = useState<NetworkStatus>(detect_initial_status);
  const [lastOfflineAt, setLastOfflineAt] = useState<number | null>(null);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(null);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear_slow_timer = useCallback(() => {
    if (slowTimerRef.current !== null) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
  }, []);

  const start_slow_timer = useCallback(() => {
    clear_slow_timer();
    slowTimerRef.current = setTimeout(() => {
      setStatus((prev) => (prev === "online" ? "slow" : prev));
    }, slowThresholdMs);
  }, [slowThresholdMs, clear_slow_timer]);

  useEffect(() => {
    function handle_online() {
      clear_slow_timer();
      setStatus("online");
      setLastOnlineAt(Date.now());
    }

    function handle_offline() {
      clear_slow_timer();
      setStatus("offline");
      setLastOfflineAt(Date.now());
    }

    window.addEventListener("online", handle_online);
    window.addEventListener("offline", handle_offline);

    return () => {
      clear_slow_timer();
      window.removeEventListener("online", handle_online);
      window.removeEventListener("offline", handle_offline);
    };
  }, [clear_slow_timer]);

  return {
    status,
    isOnline: status === "online",
    isOffline: status === "offline",
    isSlow: status === "slow",
    lastOfflineAt,
    lastOnlineAt,
    slowThresholdMs,
  };
}

export interface NetworkContextValue extends NetworkState {
  /** Set slow status after a request exceeds the threshold */
  mark_slow: () => void;
  /** Reset back to online status */
  mark_online: () => void;
  /** Backend health status */
  backend_available: boolean;
  /** Mark backend as unavailable */
  mark_backend_unavailable: () => void;
  /** Mark backend as available */
  mark_backend_available: () => void;
  /** Pending operations count (forms, mutations) */
  pending_operations: number;
  /** Register a pending operation */
  register_pending: () => () => void;
  /** Last error type detected */
  last_error_type: NetworkErrorType | null;
  /** Record a network error */
  record_error: (type: NetworkErrorType) => void;
  /** Clear the last error */
  clear_error: () => void;
}

export type NetworkErrorType =
  | "timeout"
  | "gateway_timeout"
  | "backend_unavailable"
  | "request_failed";
