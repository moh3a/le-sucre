import { CampaignDetailTabs } from "@/features/campaign_management_system/components/campaign_detail_tabs";

type PageProps = { params: Promise<{ id: string }> };

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <CampaignDetailTabs campaign_id={id} />;
}
