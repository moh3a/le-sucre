"use client";

import { useTranslations } from "next-intl";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPageClient() {
  const t = useTranslations("settings");
  return (
    <ConsolePageShell title={t("title")} subtitle={t("subtitle")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("general_title")}</CardTitle>
            <CardDescription>{t("general_description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Module de configuration à brancher sur une table `settings`.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("carriers_title")}</CardTitle>
            <CardDescription>{t("carriers_description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Variables d&apos;environnement ou chiffrement en base.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("payments_title")}</CardTitle>
            <CardDescription>{t("payments_description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configuration des prestataires de paiement.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("database_title")}</CardTitle>
            <CardDescription>{t("database_description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Actions admin DB à implémenter via jobs sécurisés.
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
