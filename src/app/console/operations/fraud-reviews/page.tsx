"use client";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { ScreenOrderDialog, FraudReviewsClient } from "@/features/operations_workflows/components/fraud-reviews-client";

export default function FraudReviewsPage() {
  const t = useTranslations("fraud_reviews");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<ScreenOrderDialog />}
    >
      <FraudReviewsClient />
    </ConsolePageShell>
  );
}
