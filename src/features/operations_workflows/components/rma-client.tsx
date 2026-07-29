"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Ban,
  Check,
  Download,
  PackageX,
  Plus,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { IssueRMADialog } from "./issue-rma-dialog";
import { InspectRMADialog } from "./inspect-rma-dialog";

const STATUS_BADGE: Record<string, string> = {
  issued: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  label_generated:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  in_transit:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  received: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inspected:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  issued: ["label_generated"],
  label_generated: ["in_transit", "received"],
  in_transit: ["received"],
  received: ["inspected"],
  inspected: ["completed"],
};

function AddLabelDialog({
  rma_id,
  open,
  onOpenChange,
}: {
  rma_id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("return_requests");
  const utils = trpc.useUtils();
  const [url, setUrl] = React.useState("");

  const genLabel = trpc.operationsWorkflows.rmaGenerateLabel.useMutation({
    onSuccess: () => {
      toast.success(t("rma_action_add_label"));
      onOpenChange(false);
      setUrl("");
      void utils.operationsWorkflows.rmaList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("rma_action_add_label")}</DialogTitle>
          <DialogDescription>{t("rma_label_placeholder")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("rma_label_placeholder")}</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              disabled={genLabel.isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={genLabel.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => genLabel.mutate({ id: rma_id, label_url: url })}
              disabled={genLabel.isPending || !url.trim()}
            >
              <Download />
              {t("rma_action_add_label")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RMASkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function RMAContent() {
  const t = useTranslations("return_requests");
  const query = trpc.operationsWorkflows.rmaList.useQuery();

  const markRecv = trpc.operationsWorkflows.rmaReceive.useMutation({
    onSuccess: () => {
      toast.success(t("rma_action_mark_received"));
      void query.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const complete = trpc.operationsWorkflows.rmaComplete.useMutation({
    onSuccess: () => {
      toast.success(t("rma_complete_success"));
      void query.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.returns.adminCancel.useMutation({
    onSuccess: () => {
      toast.success(t("request_cancelled"));
      void query.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [addLabelTarget, setAddLabelTarget] = React.useState<string | null>(null);
  const [inspectTarget, setInspectTarget] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {query.data?.length ?? 0} {t("rma_title")}
        </p>
        <IssueRMADialog />
      </div>

      <QueryGuard query={query} loadingFallback={<RMASkeleton />}>
        {query.data?.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border py-12">
            <PackageX className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">{t("rma_empty")}</p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {query.data?.map((rma) => (
              <div key={rma.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{rma.rma_number}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_BADGE[rma.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {t(`rma_status_${rma.status}`, { defaultValue: rma.status })}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t("rma_order")}: {rma.order_id.slice(0, 12)}…
                    {(rma.carrier || rma.tracking_number) && (
                      <>
                        {" · "}
                        {rma.carrier ?? t("rma_no_carrier")}
                        {rma.tracking_number && `: ${rma.tracking_number}`}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {rma.status === "issued" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddLabelTarget(rma.id)}
                    >
                      <Download />
                      {t("rma_action_add_label")}
                    </Button>
                  )}

                  {(rma.status === "issued" || rma.status === "label_generated" || rma.status === "in_transit") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markRecv.mutate({ id: rma.id })}
                      disabled={markRecv.isPending}
                    >
                      <Truck />
                      {t("rma_action_mark_received")}
                    </Button>
                  )}

                  {rma.status === "received" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInspectTarget(rma.id)}
                    >
                      <Search />
                      {t("rma_action_inspect")}
                    </Button>
                  )}

                  {rma.status === "inspected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => complete.mutate({ id: rma.id })}
                      disabled={complete.isPending}
                    >
                      <Check />
                      {t("rma_action_complete")}
                    </Button>
                  )}

                  {["completed"].includes(rma.status) && (
                    <Button size="sm" variant="ghost" disabled>
                      <Ban />
                      {t(`rma_status_${rma.status}`, { defaultValue: rma.status })}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryGuard>

      <AddLabelDialog
        rma_id={addLabelTarget ?? ""}
        open={!!addLabelTarget}
        onOpenChange={(open) => {
          if (!open) setAddLabelTarget(null);
        }}
      />

      <InspectRMADialog
        rma_id={inspectTarget ?? ""}
        open={!!inspectTarget}
        onOpenChange={(open) => {
          if (!open) setInspectTarget(null);
        }}
      />
    </div>
  );
}
