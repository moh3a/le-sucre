"use client";

import { trpc } from "@/components/providers/app-providers";
import { useState } from "react";

export function ABTestingClient() {
  const { data: groups } = trpc.campaigns.abTestGroups.useQuery();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { data: report } = trpc.campaigns.abTestReport.useQuery(
    { test_group: selectedGroup ?? "", days: 30 },
    { enabled: !!selectedGroup },
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">A/B Testing</h1>
      <p className="text-sm text-gray-500">Monitor and analyze campaign A/B test variants.</p>

      <div className="flex flex-wrap gap-2">
        {groups?.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`rounded px-4 py-2 text-sm font-medium ${selectedGroup === g ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {g}
          </button>
        ))}
        {(!groups || groups.length === 0) && <p className="text-sm text-gray-400">No A/B test groups found</p>}
      </div>

      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Impressions" value={report.total_impressions} />
            <StatCard label="Total Conversions" value={report.total_conversions} />
            <StatCard label="Significant" value={report.significant ? "Yes" : "No"} />
            <StatCard label="Winner" value={report.winner_id ? report.variants.find(v => v.variant_id === report.winner_id)?.name ?? "—" : "—"} />
          </div>

          <div className="rounded-lg border overflow-x-auto">
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
                {report.variants.map((v) => (
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
