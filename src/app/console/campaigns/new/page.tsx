import { ConsolePageShell } from "@/components/console/console-page-shell";
import { CampaignForm } from "@/features/marketing/campaign/components/campaign_form";

export const metadata = { title: "Nouvelle campagne" };

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
