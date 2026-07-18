"use client";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CreateSLADialog, SLAClient } from "@/features/operations_workflows/components/sla-client";

export default function SLADefinitionsPage() {
  const t = useTranslations("sla");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreateSLADialog />}
    >
      <SLAClient />
    </ConsolePageShell>
  );
}
