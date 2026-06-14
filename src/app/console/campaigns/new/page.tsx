import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CampaignForm } from "@/features/campaign_management_system/components/campaign_form";

export default function NewCampaignPage() {
  return (
    <ConsolePageShell
      title="Nouvelle Campagne"
      subtitle="Créez une nouvelle campagne marketing ou bannière promotionnelle pour le storefront."
      back_href="/console/campaigns"
    >
      <CampaignForm mode="create" />
    </ConsolePageShell>
  );
}
