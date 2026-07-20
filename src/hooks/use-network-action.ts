"use client";

import { useCallback, useRef } from "react";
import { useNetworkContext } from "@/components/network/network-provider";

interface UseNetworkActionOptions {
  /** Prevent duplicate invocations while already executing */
  prevent_duplicate?: boolean;
  /** Disable when offline */
  disable_when_offline?: boolean;
  /** Disable when backend is unavailable */
  disable_when_backend_down?: boolean;
  /** Called when the action is blocked */
  onBlocked?: () => void;
}

interface UseNetworkActionReturn {
  /** Whether the action is currently blocked */
  isBlocked: boolean;
  /** Whether a duplicate is in progress */
  isInProgress: boolean;
  /** Whether the user is offline */
  isOffline: boolean;
  /** Whether the backend is unavailable */
  isBackendDown: boolean;
  /** Wrap an async action with network guards */
  guard: <T>(action: () => Promise<T>) => () => Promise<T | undefined>;
  /** Check if action is allowed and execute */
  execute: <T>(action: () => Promise<T>) => Promise<T | undefined>;
}

export function useNetworkAction(options: UseNetworkActionOptions = {}): UseNetworkActionReturn {
  const {
    prevent_duplicate = true,
    disable_when_offline = true,
    disable_when_backend_down = false,
    onBlocked,
  } = options;

  const { isOffline, backend_available, register_pending } = useNetworkContext();

  const in_progress_ref = useRef(false);

  const is_blocked =
    (disable_when_offline && isOffline) || (disable_when_backend_down && !backend_available);

  const isInProgress = in_progress_ref.current;

  const execute = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | undefined> => {
      if (is_blocked) {
        onBlocked?.();
        return undefined;
      }

      if (prevent_duplicate && in_progress_ref.current) {
        onBlocked?.();
        return undefined;
      }

      in_progress_ref.current = true;
      const unregister = register_pending();

      try {
        const result = await action();
        return result;
      } finally {
        in_progress_ref.current = false;
        unregister();
      }
    },
    [is_blocked, prevent_duplicate, onBlocked, register_pending],
  );

  const guard = useCallback(
    <T>(action: () => Promise<T>) =>
      () =>
        execute(action),
    [execute],
  );

  return {
    isBlocked: is_blocked,
    isInProgress,
    isOffline,
    isBackendDown: !backend_available,
    guard,
    execute,
  };
}
