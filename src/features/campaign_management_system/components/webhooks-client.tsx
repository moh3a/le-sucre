"use client";

import { trpc } from "@/components/providers/app-providers";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function WebhooksClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const [campaignId, setCampaignId] = useState("");
  const { data: events } = trpc.campaigns.webhookEvents.useQuery(
    { campaign_id: campaignId || undefined, limit: 50 },
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t("webhook_events")}</h1>

      <div className="flex gap-2">
        <input
          placeholder={t("filter_by_campaign_id")}
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="rounded border px-3 py-2 text-sm flex-1 max-w-md"
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
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
            {events?.map((ev, i) => (
              <tr key={i}>
                <td className="px-4 py-2 font-medium">{ev.event}</td>
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{ev.campaign_id.slice(0, 12)}</td>
                <td className="px-4 py-2">{ev.campaign_name}</td>
                <td className="px-4 py-2">{ev.campaign_type}</td>
                <td className="px-4 py-2">{ev.status}</td>
                <td className="px-4 py-2 text-gray-500">{new Date(ev.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">{t("no_webhook_events")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
