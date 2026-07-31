"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useState } from "react";

function WebhooksSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="px-4 py-2 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} className="px-4 py-2">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WebhooksClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const [campaignId, setCampaignId] = useState("");
  const query = trpc.campaigns.webhookEvents.useQuery({
    campaign_id: campaignId || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t("webhook_events")}</h1>

      <div className="flex gap-2">
        <input
          placeholder={t("filter_by_campaign_id")}
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="border-input bg-background max-w-md flex-1 rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <QueryGuard query={query} loadingFallback={<WebhooksSkeleton />}>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">{t("event_column")}</th>
                <th className="px-4 py-2 text-left font-medium">{t("campaign_id_column")}</th>
                <th className="px-4 py-2 text-left font-medium">{t("campaign_column")}</th>
                <th className="px-4 py-2 text-left font-medium">{tc("type")}</th>
                <th className="px-4 py-2 text-left font-medium">{tc("status")}</th>
                <th className="px-4 py-2 text-left font-medium">{t("timestamp_column")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.data?.map((ev, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-medium">{ev.event}</td>
                  <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                    {ev.campaign_id.slice(0, 12)}
                  </td>
                  <td className="px-4 py-2">{ev.campaign_name}</td>
                  <td className="px-4 py-2">{ev.campaign_type}</td>
                  <td className="px-4 py-2">{ev.status}</td>
                  <td className="text-muted-foreground px-4 py-2">
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {query.data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center text-sm">
                    {t("no_webhook_events")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </QueryGuard>
    </div>
  );
}
