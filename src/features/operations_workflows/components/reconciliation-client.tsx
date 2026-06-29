"use client";

import { trpc } from "@/components/providers/app-providers";

export function ReconciliationClient() {
  const { data: entries } = trpc.operationsWorkflows.reconciliationList.useQuery();
  const { data: stats } = trpc.operationsWorkflows.reconciliationStats.useQuery();
  const utils = trpc.useUtils();
  const match = trpc.operationsWorkflows.reconciliationMatch.useMutation({ onSuccess: () => utils.invalidate() });
  const flag = trpc.operationsWorkflows.reconciliationFlagDiscrepancy.useMutation({ onSuccess: () => utils.invalidate() });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Payment Reconciliation</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats?.matched?.count ?? 0}</p>
          <p className="text-xs text-gray-500">Matched</p>
          <p className="text-xs text-gray-400">${Number(stats?.matched?.total ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats?.unmatched?.count ?? 0}</p>
          <p className="text-xs text-gray-500">Unmatched</p>
          <p className="text-xs text-gray-400">${Number(stats?.unmatched?.total ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats?.discrepancies ?? 0}</p>
          <p className="text-xs text-gray-500">Discrepancies</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">All Entries ({entries?.length ?? 0})</h2>
        <div className="divide-y">
          {entries?.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Order #{e.order_id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">${Number(e.amount).toFixed(2)} · {e.status}</p>
                {e.transaction_reference && <p className="text-xs text-gray-400">Ref: {e.transaction_reference}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${e.status === "matched" ? "bg-green-100 text-green-700" : e.status === "discrepancy" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {e.status}
                </span>
                {e.status === "unmatched" && (
                  <>
                    <button onClick={() => match.mutate({ id: e.id })} className="rounded bg-green-600 px-2 py-1 text-xs text-white">Match</button>
                    <button onClick={() => { const n = prompt("Discrepancy notes:"); if (n) flag.mutate({ id: e.id, notes: n }); }} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Flag</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {(!entries || entries.length === 0) && <p className="p-4 text-sm text-gray-400">No reconciliation entries</p>}
        </div>
      </div>
    </div>
  );
}
