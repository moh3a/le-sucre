"use client";

import { trpc } from "@/components/providers/app-providers";

export function RMAClient() {
  const { data: rmas, refetch } = trpc.operationsWorkflows.rmaList.useQuery();
  const issue = trpc.operationsWorkflows.rmaIssue.useMutation({ onSuccess: () => refetch() });
  const genLabel = trpc.operationsWorkflows.rmaGenerateLabel.useMutation({ onSuccess: () => refetch() });
  const markRecv = trpc.operationsWorkflows.rmaReceive.useMutation({ onSuccess: () => refetch() });
  const complete = trpc.operationsWorkflows.rmaComplete.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">RMA / Returns</h1>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">All Returns ({rmas?.length ?? 0})</h2>
        <div className="divide-y">
          {rmas?.map((rma) => (
            <div key={rma.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{rma.rma_number}</p>
                <p className="text-xs text-gray-500">Order: {rma.order_id.slice(0, 8)} · {rma.status}</p>
                {rma.carrier && <p className="text-xs text-gray-400">{rma.carrier}: {rma.tracking_number}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(rma.status)}`}>{rma.status}</span>
                {rma.status === "pending" && <button onClick={() => issue.mutate({ order_id: rma.order_id })} className="rounded bg-blue-600 px-2 py-1 text-xs text-white">Issue RMA</button>}
                {rma.status === "issued" && <button onClick={() => { const l = prompt("Label URL:"); if (l) genLabel.mutate({ id: rma.id, label_url: l }); }} className="rounded bg-purple-600 px-2 py-1 text-xs text-white">Add Label</button>}
                {rma.status === "label_generated" && <button onClick={() => markRecv.mutate({ id: rma.id })} className="rounded bg-green-600 px-2 py-1 text-xs text-white">Mark Received</button>}
                {rma.status === "received" && <button onClick={() => complete.mutate({ id: rma.id })} className="rounded bg-gray-600 px-2 py-1 text-xs text-white">Complete</button>}
              </div>
            </div>
          ))}
          {(!rmas || rmas.length === 0) && <p className="p-4 text-sm text-gray-400">No RMA records</p>}
        </div>
      </div>
    </div>
  );
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    issued: "bg-blue-100 text-blue-700",
    label_generated: "bg-purple-100 text-purple-700",
    in_transit: "bg-yellow-100 text-yellow-700",
    received: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
