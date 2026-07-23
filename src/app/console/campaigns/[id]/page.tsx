import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CampaignDetailTabs } from "@/features/campaign_management_system/components/campaign_detail_tabs";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Campagne ${id}` };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <ConsolePageShell
      title="Campagne"
      subtitle="Détail et gestion de la campagne"
      back_href="/console/campaigns"
    >
      <CampaignDetailTabs campaign_id={id} />
    </ConsolePageShell>
  );
}
