"use client";

import { useSyncExternalStore, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function CookieConsentBanner() {
  const isClient = useIsClient();
  const t = useTranslations("cookie_consent");
  const { show_banner, accept_all, reject_all, consent, save_preferences } = useCookieConsent();
  const [open, setOpen] = useState(false);

  if (!isClient) return null;
  if (!show_banner) return null;

  return (
    <>
      <div className="bg-background/50 fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-sm">
            <p className="font-medium">{t("title")}</p>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              {t("customize")}
            </Button>
            <Button variant="outline" size="sm" onClick={reject_all}>
              {t("reject_all")}
            </Button>
            <Button size="sm" onClick={accept_all}>
              {t("accept_all")}
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferencesDialog
        open={open}
        onOpenChange={setOpen}
        consent={consent}
        onSave={save_preferences}
      />
    </>
  );
}
