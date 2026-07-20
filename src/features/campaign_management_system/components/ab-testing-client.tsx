"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

function ABTestingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4 text-center">
            <Skeleton className="mx-auto h-8 w-16" />
            <Skeleton className="mx-auto h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ABTestingClient() {
  const groupsQuery = trpc.campaigns.abTestGroups.useQuery();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const reportQuery = trpc.campaigns.abTestReport.useQuery(
    { test_group: selectedGroup ?? "", days: 30 },
    { enabled: !!selectedGroup },
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">A/B Testing</h1>
      <p className="text-muted-foreground text-sm">
        Monitor and analyze campaign A/B test variants.
      </p>

      <QueryGuard query={groupsQuery} loadingFallback={<ABTestingSkeleton />}>
        <div className="flex flex-wrap gap-2">
          {groupsQuery.data?.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                selectedGroup === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {g}
            </button>
          ))}
          {groupsQuery.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">No A/B test groups found</p>
          )}
        </div>

        {selectedGroup && (
          <QueryGuard query={reportQuery} loadingFallback={<ABTestingSkeleton />}>
            {reportQuery.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard label="Total Impressions" value={reportQuery.data.total_impressions} />
                  <StatCard label="Total Conversions" value={reportQuery.data.total_conversions} />
                  <StatCard
                    label="Significant"
                    value={reportQuery.data.significant ? "Yes" : "No"}
                  />
                  <StatCard
                    label="Winner"
                    value={
                      reportQuery.data.winner_id
                        ? (reportQuery.data.variants.find(
                            (v) => v.variant_id === reportQuery.data.winner_id,
                          )?.name ?? "—")
                        : "—"
                    }
                  />
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Variant</th>
                        <th className="px-4 py-2 text-right font-medium">Traffic</th>
                        <th className="px-4 py-2 text-right font-medium">Impressions</th>
                        <th className="px-4 py-2 text-right font-medium">Clicks</th>
                        <th className="px-4 py-2 text-right font-medium">CTR</th>
                        <th className="px-4 py-2 text-right font-medium">Conversions</th>
                        <th className="px-4 py-2 text-right font-medium">Conv. Rate</th>
                        <th className="px-4 py-2 text-right font-medium">Revenue</th>
                        <th className="px-4 py-2 text-right font-medium">Confidence</th>
                        <th className="px-4 py-2 text-center font-medium">Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportQuery.data.variants.map((v) => (
                        <tr key={v.variant_id} className={v.winner ? "bg-green-50" : ""}>
                          <td className="px-4 py-2 font-medium">{v.name}</td>
                          <td className="px-4 py-2 text-right">{v.traffic_split}%</td>
                          <td className="px-4 py-2 text-right">{v.impressions}</td>
                          <td className="px-4 py-2 text-right">{v.clicks}</td>
                          <td className="px-4 py-2 text-right">{v.ctr.toFixed(2)}%</td>
                          <td className="px-4 py-2 text-right">{v.conversions}</td>
                          <td className="px-4 py-2 text-right">{v.conversion_rate.toFixed(2)}%</td>
                          <td className="px-4 py-2 text-right">${v.revenue.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{v.confidence}%</td>
                          <td className="px-4 py-2 text-center">{v.winner ? "🏆" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </QueryGuard>
        )}
      </QueryGuard>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}
