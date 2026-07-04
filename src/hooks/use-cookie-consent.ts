"use client";

import { useCallback, useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "le_sucre_cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

export type CookieCategory = "necessary" | "analytics" | "marketing";

export type CookieConsent = {
  accepted: boolean;
  categories: Record<CookieCategory, boolean>;
  updatedAt: string;
};

const default_consent: CookieConsent = {
  accepted: false,
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
  },
  updatedAt: "",
};

function read_consent(): CookieConsent {
  if (typeof document === "undefined") return default_consent;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_CONSENT_KEY}=`));
  if (!raw) return default_consent;
  try {
    return JSON.parse(decodeURIComponent(raw.split("=")[1])) as CookieConsent;
  } catch {
    return default_consent;
  }
}

function write_consent(consent: CookieConsent) {
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_EXPIRY_DAYS);
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(default_consent);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(read_consent());
    setLoaded(true);
  }, []);

  const accept_all = useCallback(() => {
    const new_consent: CookieConsent = {
      accepted: true,
      categories: { necessary: true, analytics: true, marketing: true },
      updatedAt: new Date().toISOString(),
    };
    write_consent(new_consent);
    setConsent(new_consent);
  }, []);

  const reject_all = useCallback(() => {
    const new_consent: CookieConsent = {
      accepted: true,
      categories: { necessary: true, analytics: false, marketing: false },
      updatedAt: new Date().toISOString(),
    };
    write_consent(new_consent);
    setConsent(new_consent);
  }, []);

  const save_preferences = useCallback(
    (categories: Record<CookieCategory, boolean>) => {
      const new_consent: CookieConsent = {
        accepted: true,
        categories: { necessary: true, analytics: categories.analytics, marketing: categories.marketing },
        updatedAt: new Date().toISOString(),
      };
      write_consent(new_consent);
      setConsent(new_consent);
    },
    [],
  );

  const show_banner = loaded && !consent.accepted;

  return {
    consent,
    loaded,
    show_banner,
    accept_all,
    reject_all,
    save_preferences,
  };
}
