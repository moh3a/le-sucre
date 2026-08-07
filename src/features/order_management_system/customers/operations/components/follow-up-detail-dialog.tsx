"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { CalendarClock, User } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  completed: "default",
  cancelled: "destructive",
  rescheduled: "secondary",
};

const PRIORITY_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  normal: "secondary",
  high: "default",
  urgent: "destructive",
};

export function FollowUpDetailDialog({
  followUpId,
  open,
  onOpenChange,
}: {
  followUpId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("follow_ups");
  const { data: followUp, isLoading } = trpc.operations.customerGetFollowUp.useQuery(
    { id: followUpId ?? "" },
    { enabled: open && !!followUpId },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{t("detail_title")}</DialogTitle>
          <DialogDescription>{t("detail_description")}</DialogDescription>
        </DialogHeader>
        <QueryGuard query={{ isLoading }}>
          {followUp && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{followUp.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={STATUS_STYLES[followUp.status] ?? "outline"}>
                    {t(`status_${followUp.status}`)}
                  </Badge>
                  <Badge
                    variant={PRIORITY_STYLES[followUp.priority] ?? "outline"}
                    className="uppercase text-[10px]"
                  >
                    {t(`priority_${followUp.priority}`)}
                  </Badge>
                  <Badge variant="secondary">{t(`fu_type_${followUp.follow_up_type}`)}</Badge>
                </div>
              </div>

              {followUp.description && (
                <p className="text-muted-foreground text-sm">{followUp.description}</p>
              )}

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">{t("scheduled_column")}:</span>
                  <span>{formatDate(followUp.scheduled_at, { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                {followUp.completed_at && (
                  <div className="flex items-center gap-2">
                    <CalendarClock className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground">{t("completed_at")}:</span>
                    <span>{formatDate(followUp.completed_at, { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                )}
                {followUp.user_id && (
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground">{t("client")}:</span>
                    <span className="font-mono text-xs">{followUp.user_id}</span>
                  </div>
                )}
                {followUp.assigned_to_user_id && (
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground">{t("assigned_to")}:</span>
                    <span className="font-mono text-xs">{followUp.assigned_to_user_id}</span>
                  </div>
                )}
              </div>

              <Separator />

              {followUp.order_id && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{t("order_column")}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/console/orders/${followUp.order_id}`}>
                      {followUp.order_id.slice(0, 12)}…
                    </Link>
                  </Button>
                </div>
              )}

              {followUp.result_notes && (
                <div>
                  <span className="text-muted-foreground text-sm">{t("result_notes")}</span>
                  <p className="mt-1 rounded-md bg-muted p-3 text-sm">{followUp.result_notes}</p>
                </div>
              )}

              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  {t("created_column")}: {formatDate(followUp.created_at, { dateStyle: "medium" })}
                </span>
                {followUp.created_by_user_id && (
                  <span className="font-mono">{followUp.created_by_user_id}</span>
                )}
              </div>
            </div>
          )}
        </QueryGuard>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
