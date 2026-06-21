import type { Metadata } from "next";

import { CampaignDetailTabs } from "@/features/campaign_management_system/components/campaign_detail_tabs";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Analytiques - Campagne ${id}` };
}

export default async function CampaignAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  return <CampaignDetailTabs campaign_id={id} default_tab="analytics" />;
}
