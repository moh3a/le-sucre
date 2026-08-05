import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CampaignForm } from "@/features/marketing/campaign/components/campaign_form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("campaigns");
  return { title: t("new_campaign") };
}

export default async function NewCampaignPage() {
  const t = await getTranslations("campaigns");

  return (
    <ConsolePageShell
      title={t("new_campaign")}
      subtitle={t("new_campaign_subtitle")}
      back_href="/console/campaigns"
    >
      <CampaignForm mode="create" />
    </ConsolePageShell>
  );
}
