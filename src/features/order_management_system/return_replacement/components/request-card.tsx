"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, Check, Truck, X } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import {
  RETURN_REQUEST_STATUS_LABELS,
  RETURN_REQUEST_STATUS_BADGE,
} from "../constants/status";
import { get_type_icon } from "./helpers";
import type { ReturnRequestRow } from "./types";

type RequestCardProps = {
  request: ReturnRequestRow;
  on_update: () => void;
};

export function RequestCard({ request, on_update }: RequestCardProps) {
  const t = useTranslations("orders");
  const review_mutation = trpc.returns.adminReview.useMutation({
    onSuccess: () => {
      toast.success(t("request_updated"));
      on_update();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  const receive_mutation = trpc.returns.adminReceive.useMutation({
    onSuccess: () => {
      toast.success(t("reception_recorded"));
      on_update();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  const complete_mutation = trpc.returns.adminComplete.useMutation({
    onSuccess: () => {
      toast.success(t("return_completed"));
      on_update();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  const cancel_mutation = trpc.returns.adminCancel.useMutation({
    onSuccess: () => {
      toast.success(t("request_cancelled"));
      on_update();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  const [review_note, set_review_note] = useState("");
  const [refund_amount, set_refund_amount] = useState(request.refund_amount ?? "");

  return (
    <QueryGuard mutation={review_mutation}>
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {get_type_icon(request.type)}
            <CardTitle>
              {request.type === "return"
                ? t("return")
                : request.type === "replacement"
                  ? t("replacement")
                  : t("failed_delivery")}
            </CardTitle>
          </div>
          <Badge variant={RETURN_REQUEST_STATUS_BADGE[request.status] ?? "outline"}>
            {RETURN_REQUEST_STATUS_LABELS[request.status] ?? request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {request.reason && (
          <div className="text-sm">
            <span className="text-muted-foreground text-xs font-medium">{t("reason_colon")}</span>
            <p className="mt-0.5">{request.reason}</p>
          </div>
        )}

        {request.items && request.items.length > 0 && (
          <div className="rounded-md border text-sm">
            <table className="w-full text-xs">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{t("product")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("sku")}</th>
                  <th className="px-3 py-2 text-right font-medium">{t("qty")}</th>
                  <th className="px-3 py-2 text-right font-medium">{t("price")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {request.items.map((item, idx) => (
                  <tr key={item.sku_id + idx}>
                    <td className="px-3 py-2 font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 font-mono">{item.sku_code}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.unit_price).toLocaleString("fr-FR")} DZD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {request.admin_note && (
          <div className="text-sm">
            <span className="text-muted-foreground text-xs font-medium">{t("note_colon")}</span>
            <p className="mt-0.5">{request.admin_note}</p>
          </div>
        )}

        {request.refund_amount && request.status !== "cancelled" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("refund_colon")}</span>
            <span className="font-semibold">
              {Number(request.refund_amount).toLocaleString("fr-FR")} DZD
            </span>
          </div>
        )}

        <div className="text-muted-foreground text-xs">
          {t("created_on")}{" "}
          {formatDate(request.created_at, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        <Separator />

        {/* Actions based on status */}
        {request.status === "pending" && (
          <div className="space-y-2">
            <Textarea
              placeholder={t("approval_note_placeholder")}
              value={review_note}
              onChange={(e) => set_review_note(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder={t("refund_amount_placeholder")}
                value={refund_amount}
                onChange={(e) => set_refund_amount(e.target.value)}
                className="h-8 w-48 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="gap-1"
                disabled={review_mutation.isPending}
                onClick={() =>
                  review_mutation.mutate({
                    id: request.id,
                    status: "approved",
                    admin_note: review_note || undefined,
                    refund_amount: refund_amount ? Number(refund_amount) : undefined,
                  })
                }
              >
                <Check className="h-3 w-3" />
                {t("approve")}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                disabled={review_mutation.isPending}
                onClick={() =>
                  review_mutation.mutate({
                    id: request.id,
                    status: "rejected",
                    admin_note: review_note || undefined,
                  })
                }
              >
                <X className="h-3 w-3" />
                {t("reject")}
              </Button>
            </div>
          </div>
        )}

        {request.status === "approved" && request.type !== "replacement" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1"
              disabled={receive_mutation.isPending}
              onClick={() => receive_mutation.mutate({ id: request.id })}
            >
              <Truck className="h-3 w-3" />
              {t("mark_received")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={cancel_mutation.isPending}
                onClick={() =>
                  cancel_mutation.mutate({ id: request.id, reason: t("cancelled_manually") })
                }
              >
                <Ban className="mr-2 size-4" />
                {t("cancel")}
            </Button>
          </div>
        )}

        {request.status === "received" && (
          <div className="space-y-2">
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder={t("final_refund_amount_placeholder")}
              value={refund_amount}
              onChange={(e) => set_refund_amount(e.target.value)}
              className="h-8 w-48 text-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="gap-1"
                disabled={complete_mutation.isPending}
                onClick={() =>
                  complete_mutation.mutate({
                    id: request.id,
                    refund_amount: refund_amount ? Number(refund_amount) : undefined,
                  })
                }
              >
                <Check className="h-3 w-3" />
                {t("complete")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
