"use client";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { SearchAgentDialog, AgentKPIClient } from "@/features/operations_workflows/components/agent-kpi-client";

export default function AgentKPIPage() {
  const t = useTranslations("agent_kpi");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<SearchAgentDialog />}
    >
      <AgentKPIClient />
    </ConsolePageShell>
  );
}
