"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, RefreshCcw, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { formatDate } from "@/lib/utils";
import { DepositDialog } from "./deposit-dialog";
import { InstallmentsDialog, InstallmentsView } from "./installments-dialog";
import { PaymentAuditLog } from "./audit-log-view";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  captured: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
  partially_refunded: "bg-purple-100 text-purple-800",
  cancelled: "bg-gray-100 text-gray-800",
  expired: "bg-gray-100 text-gray-800",
  on_hold: "bg-orange-100 text-orange-800",
};

export function PaymentDetailClient({ paymentId }: { paymentId: string }) {
  const t = useTranslations("payments");
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: payment, isFetching } = trpc.payments.adminGet.useQuery({
    transaction_id: paymentId,
  });
  const { data: refunds } = trpc.payments.adminTransactionRefunds.useQuery(
    { transaction_id: paymentId },
    { enabled: !!payment },
  );

  const captureMutation = trpc.payments.adminCapture.useMutation({
    onSuccess: () => utils.payments.adminGet.invalidate(),
  });
  const cancelMutation = trpc.payments.adminCancel.useMutation({
    onSuccess: () => utils.payments.adminGet.invalidate(),
  });
  const retryMutation = trpc.payments.adminRetry.useMutation({
    onSuccess: () => utils.payments.adminGet.invalidate(),
  });
  const retryAllFailedMutation = trpc.payments.adminRetryFailed.useMutation({
    onSuccess: () => {
      toast.success(t("retry_all_success"));
      void utils.payments.adminList.invalidate();
      void utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  if (!payment) {
    return (
      <ConsolePageShell title={t("payment_not_found")}>
        <p>{t("payment_not_found_desc")}</p>
      </ConsolePageShell>
    );
  }

  return (
    <QueryGuard query={{ isLoading: isFetching }} loadingFallback={
      <ConsolePageShell title={t("loading")}>
        <Skeleton className="h-96 w-full" />
      </ConsolePageShell>
    }>
      <ConsolePageShell
        title={`${t("title")} ${payment.id.slice(0, 12)}...`}
        subtitle={`${t("transaction_id_label")} ${payment.provider_transaction_id ?? t("provider_placeholder")}`}
        back_href="/console/payments"
        actions={
          <div className="flex flex-wrap gap-2">
            {payment.status === "pending" && (
              <Button
                onClick={() => captureMutation.mutate({ transaction_id: payment.id })}
                disabled={captureMutation.isPending}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t("capture_button")}
              </Button>
            )}
            {payment.status === "failed" && (
              <Button
                variant="outline"
                onClick={() => retryMutation.mutate({ transaction_id: payment.id })}
                disabled={retryMutation.isPending}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t("retry_button")}
              </Button>
            )}
            {(payment.status === "pending" || payment.status === "on_hold") && (
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate({ transaction_id: payment.id })}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("cancel_button")}
              </Button>
            )}
            <DepositDialog orderId={payment.order_id} />
            <InstallmentsDialog orderId={payment.order_id} />
            <Button
              variant="outline"
              onClick={() => retryAllFailedMutation.mutate()}
              disabled={retryAllFailedMutation.isPending}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {t("retry_all_button")}
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("general_information")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("status_label")}</span>
                <Badge className={STATUS_COLORS[payment.status] ?? ""} variant="outline">
                  {payment.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("type_label")}</span>
                <span className="capitalize">{payment.type}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("provider_label")}</span>
                <span className="capitalize">{payment.provider}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("amount_label")}</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: payment.currency,
                  }).format(Number(payment.amount))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("fee_label")}</span>
                <span>
                  {new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: payment.currency,
                  }).format(Number(payment.fee))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("net_label")}</span>
                <span className="font-medium text-green-600">
                  {new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: payment.currency,
                  }).format(Number(payment.net_amount))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("refunded_amount_label")}</span>
                <span>
                  {new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: payment.currency,
                  }).format(Number(payment.refunded_amount))}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("transaction_id_label")}</span>
                <span className="font-mono text-xs">{payment.id}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("provider_id_label")}</span>
                <span className="font-mono text-xs">
                  {payment.provider_transaction_id ?? t("transaction_id_placeholder")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("method_label")}</span>
                <span className="capitalize">
                  {payment.provider_payment_method ?? t("provider_placeholder")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("attempts_label")}</span>
                <span>
                  {payment.retry_count}/{payment.max_retries}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("created_label")}</span>
                <span>{formatDate(payment.created_at)}</span>
              </div>
              {payment.captured_at && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("captured_label")}</span>
                    <span>{formatDate(payment.captured_at)}</span>
                  </div>
                </>
              )}
              {payment.failure_reason && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("failure_reason_label")}</span>
                    <span className="text-red-600">{payment.failure_reason}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={refunds && refunds.length > 0 ? "refunds" : "audit"}>
          <TabsList>
            {refunds && refunds.length > 0 && (
              <TabsTrigger value="refunds">
                {t("refunds_tab", { count: refunds.length })}
              </TabsTrigger>
            )}
            <TabsTrigger value="audit">{t("audit_tab")}</TabsTrigger>
            <TabsTrigger value="installments">{t("installments_tab")}</TabsTrigger>
          </TabsList>

          {refunds && refunds.length > 0 && (
            <TabsContent value="refunds">
              <Card>
                <CardHeader>
                  <CardTitle>{t("refunds_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium">{t("id_column")}</th>
                          <th className="pb-2 font-medium">{t("amount_column")}</th>
                          <th className="pb-2 font-medium">{t("type_column")}</th>
                          <th className="pb-2 font-medium">{t("status_column")}</th>
                          <th className="pb-2 font-medium">{t("date_column")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refunds.map((refund) => (
                          <tr key={refund.id} className="border-b">
                            <td className="py-2 font-mono text-xs">
                              {refund.id.slice(0, 12)}...
                            </td>
                            <td className="py-2 font-medium">
                              {new Intl.NumberFormat("fr-DZ", {
                                style: "currency",
                                currency: refund.currency,
                              }).format(Number(refund.amount))}
                            </td>
                            <td className="py-2 capitalize">{refund.type}</td>
                            <td className="py-2">
                              <Badge
                                className={
                                  refund.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : refund.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }
                                variant="outline"
                              >
                                {refund.status}
                              </Badge>
                            </td>
                            <td className="py-2 text-muted-foreground">
                              {formatDate(refund.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>{t("audit_title")}</CardTitle>
                <CardDescription>
                  {t("audit_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentAuditLog paymentId={paymentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installments">
            <Card>
              <CardHeader>
                <CardTitle>{t("installments_title")}</CardTitle>
                <CardDescription>
                  {t("installments_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InstallmentsView orderId={payment.order_id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ConsolePageShell>
    </QueryGuard>
  );
}
