"use client";

import { trpc } from "@/components/providers/app-providers";
import Link from "next/link";

export function LandingPagesClient() {
  const { data: pages } = trpc.campaigns.landingPagesAdmin.useQuery();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Landing Pages</h1>
      <p className="text-sm text-gray-500">Manage campaign landing pages.</p>

      <div className="rounded-lg border">
        <div className="divide-y">
          {pages?.items?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link href={`/console/campaigns/${p.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                  {p.name}
                </Link>
                <p className="text-xs text-gray-500">/{p.slug} · {p.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(p.status)}`}>{p.status}</span>
                <Link href={`/console/campaigns/${p.id}`} className="text-xs text-blue-600 hover:underline">Edit</Link>
              </div>
            </div>
          ))}
          {(!pages || pages.items?.length === 0) && <p className="p-4 text-sm text-gray-400">No landing pages</p>}
        </div>
      </div>
    </div>
  );
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    scheduled: "bg-blue-100 text-blue-700",
    paused: "bg-yellow-100 text-yellow-700",
    ended: "bg-gray-100 text-gray-500",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
