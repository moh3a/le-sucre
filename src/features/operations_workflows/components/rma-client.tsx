"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";

function RMASkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-gray-50 px-4 py-2">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RMAContent() {
  const query = trpc.operationsWorkflows.rmaList.useQuery();
  const issue = trpc.operationsWorkflows.rmaIssue.useMutation({ onSuccess: () => query.refetch() });
  const genLabel = trpc.operationsWorkflows.rmaGenerateLabel.useMutation({
    onSuccess: () => query.refetch(),
  });
  const markRecv = trpc.operationsWorkflows.rmaReceive.useMutation({
    onSuccess: () => query.refetch(),
  });
  const complete = trpc.operationsWorkflows.rmaComplete.useMutation({
    onSuccess: () => query.refetch(),
  });

  return (
    <QueryGuard query={query} loadingFallback={<RMASkeleton />}>
      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
          All Returns ({query.data?.length ?? 0})
        </h2>
        <div className="divide-y">
          {query.data?.map((rma) => (
            <div key={rma.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{rma.rma_number}</p>
                <p className="text-muted-foreground text-xs">
                  Order: {rma.order_id.slice(0, 8)} · {rma.status}
                </p>
                {rma.carrier && (
                  <p className="text-muted-foreground text-xs">
                    {rma.carrier}: {rma.tracking_number}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(rma.status)}`}>
                  {rma.status}
                </span>
                {rma.status === "pending" && (
                  <button
                    onClick={() => issue.mutate({ order_id: rma.order_id })}
                    disabled={issue.isPending}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    Issue RMA
                  </button>
                )}
                {rma.status === "issued" && (
                  <button
                    onClick={() => {
                      const l = prompt("Label URL:");
                      if (l) genLabel.mutate({ id: rma.id, label_url: l });
                    }}
                    disabled={genLabel.isPending}
                    className="rounded bg-purple-600 px-2 py-1 text-xs text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  >
                    Add Label
                  </button>
                )}
                {rma.status === "label_generated" && (
                  <button
                    onClick={() => markRecv.mutate({ id: rma.id })}
                    disabled={markRecv.isPending}
                    className="rounded bg-green-600 px-2 py-1 text-xs text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark Received
                  </button>
                )}
                {rma.status === "received" && (
                  <button
                    onClick={() => complete.mutate({ id: rma.id })}
                    disabled={complete.isPending}
                    className="rounded bg-gray-600 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
          {query.data?.length === 0 && (
            <p className="text-muted-foreground p-4 text-sm">No RMA records</p>
          )}
        </div>
      </div>
    </QueryGuard>
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
