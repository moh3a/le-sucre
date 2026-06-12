"use client";

import { Megaphone, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CampaignForm } from "./campaign_form";
import { CampaignBannersTab } from "./campaign_banners_tab";
import { CampaignSectionsTab } from "./campaign_sections_tab";
import { CampaignTargetingTab } from "./campaign_targeting_tab";
import { CampaignAnalyticsTab } from "./campaign_analytics_tab";
import { CampaignStatusBadge } from "./campaign_status_badge";

type DetailTabsProps = {
  campaign_id: string;
  default_tab?: string;
};

export function CampaignDetailTabs({ campaign_id, default_tab }: DetailTabsProps) {
  const { data: campaign, isLoading, error } = trpc.campaigns.byId.useQuery({ id: campaign_id });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#c8d152]" />
          <p className="text-muted-foreground text-sm">Chargement de la campagne...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4 p-8 text-center">
        <h2 className="text-destructive text-xl font-bold">Erreur</h2>
        <p className="text-muted-foreground">
          {error?.message || "La campagne demandée est introuvable."}
        </p>
        <Link
          href="/console/campaigns"
          className="flex items-center justify-center gap-2 text-[#c8d152] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux campagnes
        </Link>
      </div>
    );
  }

  const format_date = (d?: string | null) => {
    if (!d) return "indéfinie";
    return format(new Date(d), "dd MMM yyyy HH:mm", { locale: fr });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Back button and Header */}
      <div className="space-y-4">
        <Link
          href="/console/campaigns"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la liste des campagnes
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c8d152]/20">
              <Megaphone className="h-6 w-6 text-[#c8d152]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-2xl font-bold">{campaign.name}</h1>
                <CampaignStatusBadge status={campaign.status} />
                <Badge variant="outline" className="text-xs capitalize">
                  {campaign.campaign_type}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                Planning : du {format_date(campaign.starts_at)} au {format_date(campaign.ends_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue={default_tab ?? "general"} className="w-full">
        <TabsList className="bg-muted grid w-full max-w-2xl grid-cols-5 rounded-xl p-1">
          <TabsTrigger value="general" className="rounded-lg py-2 text-xs font-semibold">
            Général
          </TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg py-2 text-xs font-semibold">
            Bannières ({campaign.banners?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="sections" className="rounded-lg py-2 text-xs font-semibold">
            Sections ({campaign.sections?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="targeting" className="rounded-lg py-2 text-xs font-semibold">
            Ciblage ({campaign.targets?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg py-2 text-xs font-semibold">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CampaignForm mode="edit" campaign_id={campaign_id} default_values={campaign} />
        </TabsContent>

        <TabsContent value="banners">
          <CampaignBannersTab campaign_id={campaign_id} banners={campaign.banners ?? []} />
        </TabsContent>

        <TabsContent value="sections">
          <CampaignSectionsTab campaign_id={campaign_id} sections={campaign.sections ?? []} />
        </TabsContent>

        <TabsContent value="targeting">
          <CampaignTargetingTab campaign={campaign} />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalyticsTab campaign_id={campaign_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
