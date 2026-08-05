"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignForm } from "./campaign_form";
import { CampaignBannersTab } from "./campaign_banners_tab";
import { CampaignSectionsTab } from "./campaign_sections_tab";
import { CampaignTargetingTab } from "./campaign_targeting_tab";
import { CampaignAnalyticsTab } from "./campaign_analytics_tab";
import { full_campaign_dto } from "@/features/marketing/campaign/models/campaign.dto";
import type { SectionRow } from "@/features/marketing/campaign/components/campaign_sections_tab";
import type { BannerRow } from "@/features/marketing/campaign/components/campaign_banners_tab";

type CampaignDto = z.infer<typeof full_campaign_dto>;

const tab_schema = z.enum(["general", "banners", "sections", "targeting", "analytics"]);

type DetailTabsProps = {
  campaign_id: string;
};

export function CampaignDetailTabs({ campaign_id }: DetailTabsProps) {
  const t = useTranslations("campaigns");
  const { data: campaign, isLoading } = trpc.campaigns.byId.useQuery({ id: campaign_id });

  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = tab_schema.safeParse(searchParams.get("tab"));
  const active_tab = parsed.success ? parsed.data : "general";

  const on_tab_change = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  if (!campaign) return null;

  return (
    <QueryGuard query={{ isLoading }}>
      <Tabs value={active_tab} onValueChange={on_tab_change} className="w-full">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">{t("tab_general")}</TabsTrigger>
          <TabsTrigger value="banners">
            {t("tab_banners", { count: campaign.banners?.length ?? 0 })}
          </TabsTrigger>
          <TabsTrigger value="sections">
            {t("tab_sections", { count: campaign.sections?.length ?? 0 })}
          </TabsTrigger>
          <TabsTrigger value="targeting">
            {t("tab_targeting", { count: campaign.targets?.length ?? 0 })}
          </TabsTrigger>
          <TabsTrigger value="analytics">{t("tab_analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CampaignForm
            mode="edit"
            campaign_id={campaign_id}
            default_values={campaign as unknown as CampaignDto}
          />
        </TabsContent>

        <TabsContent value="banners">
          <CampaignBannersTab
            campaign_id={campaign_id}
            banners={(campaign.banners as unknown as BannerRow[]) ?? []}
          />
        </TabsContent>

        <TabsContent value="sections">
          <CampaignSectionsTab
            campaign_id={campaign_id}
            sections={(campaign.sections as unknown as SectionRow[]) ?? []}
          />
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
