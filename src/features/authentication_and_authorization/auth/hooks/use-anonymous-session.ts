"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth/client";
import logger from "@/lib/logger";

export function useAnonymousSession() {
  const { data: session, isPending } = authClient.useSession();
  const attempted = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (session) return;
    if (attempted.current) return;

    attempted.current = true;

    authClient.signIn.anonymous().then(({ error: e }) => {
      if (e) {
        logger.error("[Anonymous Auth] Failed to create anonymous session:", e);
      }
    });
  }, [isPending, session]);

  return session;
}
