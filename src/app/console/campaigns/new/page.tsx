import { CampaignForm } from "@/features/campaign_management_system/components/campaign_form";

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">Nouvelle Campagne</h1>
        <p className="text-sm text-muted-foreground">
          Créez une nouvelle campagne marketing ou bannière promotionnelle pour le storefront.
        </p>
      </div>
      <CampaignForm mode="create" />
    </div>
  );
}
