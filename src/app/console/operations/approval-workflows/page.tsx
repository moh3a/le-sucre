"use client";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CreateWorkflowDialog, ApprovalWorkflowsClient } from "@/features/operations_workflows/components/approval-workflows-client";

export default function ApprovalWorkflowsPage() {
  const t = useTranslations("approval_workflows");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreateWorkflowDialog />}
    >
      <ApprovalWorkflowsClient />
    </ConsolePageShell>
  );
}
