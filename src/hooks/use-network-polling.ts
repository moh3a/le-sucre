"use client";

import { useEffect, useRef, useCallback } from "react";
import { useNetworkContext } from "@/components/network/network-provider";

interface UseNetworkPollingOptions {
  /** The polling callback */
  callback: () => void;
  /** Polling interval in ms */
  interval_ms: number;
  /** Whether polling is enabled */
  enabled?: boolean;
}

/**
 * Polling hook that automatically pauses when offline
 * and resumes when back online.
 */
export function useNetworkPolling({
  callback,
  interval_ms,
  enabled = true,
}: UseNetworkPollingOptions) {
  const { isOnline } = useNetworkContext();
  const interval_ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const callback_ref = useRef(callback);

  callback_ref.current = callback;

  const stop = useCallback(() => {
    if (interval_ref.current !== null) {
      clearInterval(interval_ref.current);
      interval_ref.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    interval_ref.current = setInterval(() => {
      callback_ref.current();
    }, interval_ms);
  }, [interval_ms, stop]);

  useEffect(() => {
    if (!enabled || !isOnline) {
      stop();
      return;
    }

    start();
    return stop;
  }, [enabled, isOnline, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return stop;
  }, [stop]);
}
