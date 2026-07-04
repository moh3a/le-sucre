"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";

export function CookieSettingsSection() {
  const t = useTranslations("account");
  const { consent, accept_all, save_preferences } = useCookieConsent();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("cookie_preferences_title")}</CardTitle>
          <CardDescription>
            {t("cookie_preferences_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setOpen(true)}>
            {t("cookie_customize")}
          </Button>
          <Button onClick={accept_all}>{t("cookie_accept_all")}</Button>
        </CardContent>
      </Card>

      <CookiePreferencesDialog
        open={open}
        onOpenChange={setOpen}
        consent={consent}
        onSave={save_preferences}
      />
    </>
  );
}
