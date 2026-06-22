"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, RefreshCcw, XCircle } from "lucide-react";
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

  if (!payment) {
    return (
      <ConsolePageShell title="Paiement introuvable">
        <p>Le paiement demandé n'existe pas.</p>
      </ConsolePageShell>
    );
  }

  return (
    <QueryGuard query={{ isLoading: isFetching }} loadingFallback={<ConsolePageShell title="Chargement..."><Skeleton className="h-96 w-full" /></ConsolePageShell>}>
      <ConsolePageShell
        title={`Paiement ${payment.id.slice(0, 12)}...`}
      subtitle={`Transaction ${payment.provider_transaction_id ?? "N/A"}`}
      back_href="/console/payments"
      actions={
        <div className="flex gap-2">
          {payment.status === "pending" && (
            <Button
              onClick={() => captureMutation.mutate({ transaction_id: payment.id })}
              disabled={captureMutation.isPending}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Capturer
            </Button>
          )}
          {payment.status === "failed" && (
            <Button
              variant="outline"
              onClick={() => retryMutation.mutate({ transaction_id: payment.id })}
              disabled={retryMutation.isPending}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          )}
          {(payment.status === "pending" || payment.status === "on_hold") && (
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate({ transaction_id: payment.id })}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          )}
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge className={STATUS_COLORS[payment.status] ?? ""} variant="outline">
                {payment.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{payment.type}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fournisseur</span>
              <span className="capitalize">{payment.provider}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium">
                {new Intl.NumberFormat("fr-DZ", {
                  style: "currency",
                  currency: payment.currency,
                }).format(Number(payment.amount))}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais</span>
              <span>
                {new Intl.NumberFormat("fr-DZ", {
                  style: "currency",
                  currency: payment.currency,
                }).format(Number(payment.fee))}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net</span>
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat("fr-DZ", {
                  style: "currency",
                  currency: payment.currency,
                }).format(Number(payment.net_amount))}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remboursé</span>
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
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Transaction</span>
              <span className="font-mono text-xs">{payment.id}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Fournisseur</span>
              <span className="font-mono text-xs">
                {payment.provider_transaction_id ?? "N/A"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Méthode</span>
              <span className="capitalize">
                {payment.provider_payment_method ?? "N/A"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tentatives</span>
              <span>
                {payment.retry_count}/{payment.max_retries}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créé le</span>
              <span>{formatDate(payment.created_at)}</span>
            </div>
            {payment.captured_at && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capturé le</span>
                  <span>{formatDate(payment.captured_at)}</span>
                </div>
              </>
            )}
            {payment.failure_reason && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Raison d'échec</span>
                  <span className="text-red-600">{payment.failure_reason}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {refunds && refunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Remboursements ({refunds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">ID</th>
                    <th className="pb-2 font-medium">Montant</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium">Date</th>
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
      )}
    </ConsolePageShell>
    </QueryGuard>
  );
}
