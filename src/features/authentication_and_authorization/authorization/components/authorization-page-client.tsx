"use client";

import { useTranslations } from "next-intl";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { AuthorizationTable } from "./authorization-table";
import { AuthorizationRoleEditor } from "./authorization-role-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AuthorizationPageClient() {
  const t = useTranslations("authorization");
  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<AuthorizationRoleEditor />}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("matrix_title")}</CardTitle>
          <CardDescription>
            {t("matrix_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthorizationTable />
        </CardContent>
      </Card>
    </ConsolePageShell>
  );
}
