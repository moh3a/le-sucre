"use client";

import { useState } from "react";
import { Ban, TriangleAlert, PauseCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

const ESCALATION_STATUS_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  open: "destructive",
  in_review: "secondary",
  resolved: "default",
  dismissed: "outline",
};

const CANCELLATION_STATUS_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  approved: "destructive",
  rejected: "default",
};

type OrderOpsTabProps = {
  order_id: string;
  order_status: string;
};

export function OrderOperationsTab({ order_id }: OrderOpsTabProps) {
  const t = useTranslations("orders");
  const utils = trpc.useUtils();

  // Holds
  const { data: holds, refetch: refetch_holds } = trpc.operations.orderGetHolds.useQuery({ order_id });
  const [hold_reason, set_hold_reason] = useState("");
  const [hold_desc, set_hold_desc] = useState("");
  const place_hold = trpc.operations.orderPlaceOnHold.useMutation({
    onSuccess: () => {
      refetch_holds();
      set_hold_reason("");
      set_hold_desc("");
      toast.success(t("hold_placed"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });
  const release_hold = trpc.operations.orderReleaseHold.useMutation({
    onSuccess: () => {
      refetch_holds();
      toast.success(t("hold_released"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  // Escalations
  const { data: escalations, refetch: refetch_esc } = trpc.operations.orderGetEscalations.useQuery({ order_id });
  const [esc_reason, set_esc_reason] = useState("");
  const [esc_priority, set_esc_priority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const escalate = trpc.operations.orderEscalate.useMutation({
    onSuccess: () => {
      refetch_esc();
      set_esc_reason("");
      toast.success(t("escalation_created"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });
  const resolve_esc = trpc.operations.orderResolveEscalation.useMutation({
    onSuccess: () => {
      refetch_esc();
      toast.success(t("escalation_resolved"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  // Cancellation requests
  const { data: cancellations, refetch: refetch_cancel } = trpc.operations.orderGetCancellationRequests.useQuery({ order_id });
  const [cancel_reason, set_cancel_reason] = useState("");
  const request_cancel = trpc.operations.orderRequestCancellation.useMutation({
    onSuccess: () => {
      refetch_cancel();
      set_cancel_reason("");
      toast.success(t("cancellation_requested"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });
  const review_cancel = trpc.operations.orderReviewCancellation.useMutation({
    onSuccess: () => {
      refetch_cancel();
      utils.orders.adminGet.invalidate({ order_id });
      toast.success(t("cancellation_reviewed"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  const active_hold = holds?.find((h) => h.is_active);

  return (
    <QueryGuard query={{ isLoading: !holds && !escalations && !cancellations }} mutation={{ isPending: place_hold.isPending || release_hold.isPending || escalate.isPending }}>
    <div className="space-y-6">
      {/* ── Holds ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <PauseCircle className="h-4 w-4" />
            {t("hold_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {active_hold ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">{t("order_on_hold")}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t("reason")}: {active_hold.reason}
                  </p>
                  {active_hold.description && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {active_hold.description}
                    </p>
                  )}
                  <p className="text-xs text-amber-500">
                    {t("since")} {formatDate(active_hold.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    release_hold.mutate({ hold_id: active_hold.id })
                  }
                  disabled={release_hold.isPending}
                >
                  <PlayCircle className="mr-1 h-3 w-3" />
                  {t("release_hold")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <Label>{t("reason")}</Label>
                <Select value={hold_reason} onValueChange={set_hold_reason}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t("select_reason")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_verification">{t("payment_verification")}</SelectItem>
                    <SelectItem value="fraud_check">{t("fraud_check")}</SelectItem>
                    <SelectItem value="customer_request">{t("customer_request")}</SelectItem>
                    <SelectItem value="stock_issue">{t("stock_issue")}</SelectItem>
                    <SelectItem value="address_verification">{t("address_verification")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("description_optional")}</Label>
                <Textarea
                  value={hold_desc}
                  onChange={(e) => set_hold_desc(e.target.value)}
                  rows={2}
                  placeholder={t("additional_details_placeholder")}
                />
              </div>
              <Button
                size="sm"
                disabled={!hold_reason || place_hold.isPending}
                onClick={() => place_hold.mutate({ order_id, reason: hold_reason, description: hold_desc || undefined })}
              >
                <PauseCircle className="mr-1 h-3 w-3" />
                {t("place_on_hold")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Escalations ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" />
            {t("escalations_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>{t("create_escalation")}</Label>
                <Select value={esc_reason} onValueChange={set_esc_reason}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t("reason")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_dispute">{t("payment_dispute")}</SelectItem>
                    <SelectItem value="customer_complaint">{t("customer_complaint")}</SelectItem>
                    <SelectItem value="delivery_issue">{t("delivery_issue")}</SelectItem>
                    <SelectItem value="technical">{t("technical")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="w-32 space-y-1">
              <Label>{t("priority")}</Label>
                <Select value={esc_priority} onValueChange={(v) => set_esc_priority(v as "low" | "normal" | "high" | "urgent")}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("priority_low")}</SelectItem>
                    <SelectItem value="normal">{t("priority_normal")}</SelectItem>
                    <SelectItem value="high">{t("priority_high")}</SelectItem>
                    <SelectItem value="urgent">{t("priority_urgent")}</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <Button
              size="sm"
              disabled={!esc_reason || escalate.isPending}
              onClick={() => escalate.mutate({ order_id, reason: esc_reason, priority: esc_priority })}
            >
              <TriangleAlert className="mr-1 h-3 w-3" />
              {t("escalate")}
            </Button>
          </div>

          {(escalations?.length ?? 0) > 0 && (
            <div className="divide-y rounded-md border text-sm">
              {escalations?.map((esc) => (
                <div key={esc.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={ESCALATION_STATUS_BADGES[esc.status]}>
                        {esc.status === "open" ? t("open") : esc.status === "in_review" ? t("in_review") : esc.status === "resolved" ? t("resolved") : esc.status === "dismissed" ? t("dismissed") : esc.status}
                      </Badge>
                      <span className="text-xs font-medium">{esc.reason}</span>
                    </div>
                    {esc.description && (
                      <p className="text-muted-foreground mt-1 text-xs">{esc.description}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDate(esc.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {(esc.status === "open" || esc.status === "in_review") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => resolve_esc.mutate({ id: esc.id, resolution: t("manually_resolved") })}
                      disabled={resolve_esc.isPending}
                    >
                      {t("resolve")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Cancellation Requests ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            {t("cancellations_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>{t("request_cancellation")}</Label>
                <Select value={cancel_reason} onValueChange={set_cancel_reason}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t("reason")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_request">{t("customer_request")}</SelectItem>
                    <SelectItem value="payment_issue">{t("cancel_reason_payment_issue")}</SelectItem>
                    <SelectItem value="out_of_stock">{t("cancel_reason_out_of_stock")}</SelectItem>
                    <SelectItem value="fraud">{t("cancel_reason_fraud")}</SelectItem>
                    <SelectItem value="duplicate">{t("cancel_reason_duplicate")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <Button
              size="sm"
              disabled={!cancel_reason || request_cancel.isPending}
              onClick={() => request_cancel.mutate({ order_id, reason: cancel_reason })}
            >
              <Ban className="mr-1 h-3 w-3" />
              {t("request_cancel")}
            </Button>
          </div>

          {(cancellations?.length ?? 0) > 0 && (
            <div className="divide-y rounded-md border text-sm">
              {cancellations?.map((cr) => (
                <div key={cr.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={CANCELLATION_STATUS_BADGES[cr.status]}>
                        {cr.status === "pending" ? t("pending") : cr.status === "approved" ? t("approved") : cr.status === "rejected" ? t("rejected") : cr.status}
                      </Badge>
                      <span className="text-xs">{cr.reason}</span>
                    </div>
                    {cr.description && (
                      <p className="text-muted-foreground mt-1 text-xs">{cr.description}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDate(cr.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {cr.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                        onClick={() => review_cancel.mutate({ cancellation_request_id: cr.id, status: "approved" })}
                        disabled={review_cancel.isPending}
                      >
                        {t("approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => review_cancel.mutate({ cancellation_request_id: cr.id, status: "rejected" })}
                        disabled={review_cancel.isPending}
                      >
                        {t("reject")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
