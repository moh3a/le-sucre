"use client";

import { z } from "zod";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignForm } from "./campaign_form";
import { CampaignBannersTab } from "./campaign_banners_tab";
import { CampaignSectionsTab } from "./campaign_sections_tab";
import { CampaignTargetingTab } from "./campaign_targeting_tab";
import { CampaignAnalyticsTab } from "./campaign_analytics_tab";
import { full_campaign_dto } from "@/features/campaign_management_system/models/campaign.dto";
import type { SectionRow } from "@/features/campaign_management_system/components/campaign_sections_tab";
import type { BannerRow } from "@/features/campaign_management_system/components/campaign_banners_tab";

type CampaignDto = z.infer<typeof full_campaign_dto>;

type DetailTabsProps = {
  campaign_id: string;
  default_tab?: string;
};

export function CampaignDetailTabs({ campaign_id, default_tab }: DetailTabsProps) {
  const { data: campaign, isLoading } = trpc.campaigns.byId.useQuery({ id: campaign_id });

  if (!campaign) return null;

  return (
    <QueryGuard query={{ isLoading }}>
      <Tabs defaultValue={default_tab ?? "general"} className="w-full">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">
            Général
          </TabsTrigger>
          <TabsTrigger value="banners">
            Bannières ({campaign.banners?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="sections">
            Sections ({campaign.sections?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="targeting">
            Ciblage ({campaign.targets?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CampaignForm mode="edit" campaign_id={campaign_id} default_values={campaign as unknown as CampaignDto} />
        </TabsContent>

        <TabsContent value="banners">
            <CampaignBannersTab campaign_id={campaign_id} banners={campaign.banners as unknown as BannerRow[] ?? []} />
        </TabsContent>

        <TabsContent value="sections">
            <CampaignSectionsTab campaign_id={campaign_id} sections={campaign.sections as unknown as SectionRow[] ?? []} />
        </TabsContent>

        <TabsContent value="targeting">
            <CampaignTargetingTab campaign={campaign as unknown as CampaignDto} />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalyticsTab campaign_id={campaign_id} />
        </TabsContent>
      </Tabs>
    </QueryGuard>
  );
}
