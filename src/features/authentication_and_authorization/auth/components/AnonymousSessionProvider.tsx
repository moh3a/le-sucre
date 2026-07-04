"use client";

import { useAnonymousSession } from "../hooks/use-anonymous-session";
import { CookieConsentBanner } from "@/components/cookie-consent/cookie-consent-banner";

export function AnonymousSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAnonymousSession();
  return (
    <>
      {children}
      <CookieConsentBanner />
    </>
  );
}
