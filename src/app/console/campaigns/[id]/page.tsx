import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CampaignDetailTabs } from "@/features/marketing/campaign/components/campaign_detail_tabs";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("campaigns");
  return { title: `${t("detail_title")} ${id}` };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const t = await getTranslations("campaigns");

  return (
    <ConsolePageShell
      title={t("detail_title")}
      subtitle={t("detail_subtitle")}
      back_href="/console/campaigns"
    >
      <CampaignDetailTabs campaign_id={id} />
    </ConsolePageShell>
  );
}
