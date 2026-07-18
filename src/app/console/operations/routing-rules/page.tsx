"use client";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CreateRoutingRuleDialog, RoutingRulesClient } from "@/features/operations_workflows/components/routing-rules-client";

export default function RoutingRulesPage() {
  const t = useTranslations("routing_rules");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreateRoutingRuleDialog />}
    >
      <RoutingRulesClient />
    </ConsolePageShell>
  );
}
