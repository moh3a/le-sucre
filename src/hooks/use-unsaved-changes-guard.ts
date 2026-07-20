"use client";

import { useEffect } from "react";
import { useNetworkContext } from "@/components/network/network-provider";

/**
 * Warns the user before leaving the page when there are pending
 * network operations (mutations in progress).
 */
export function useUnsavedChangesGuard() {
  const { pending_operations } = useNetworkContext();

  useEffect(() => {
    if (pending_operations <= 0) return;

    function handle_before_unload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", handle_before_unload);
    return () => window.removeEventListener("beforeunload", handle_before_unload);
  }, [pending_operations]);
}
