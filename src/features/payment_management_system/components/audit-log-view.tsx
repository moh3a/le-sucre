"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/components/providers/app-providers";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PaymentAuditLogProps {
  paymentId: string;
}

const ACTION_LABELS: Record<string, string> = {
  "payment.created": "Paiement créé",
  "payment.captured": "Paiement capturé",
  "payment.failed": "Paiement échoué",
  "payment.refunded": "Paiement remboursé",
  "payment.partially_refunded": "Remboursement partiel",
  "payment.cancelled": "Paiement annulé",
  "payment.retried": "Nouvelle tentative",
  "refund.created": "Remboursement créé",
  "refund.approved": "Remboursement approuvé",
  "refund.rejected": "Remboursement rejeté",
  "refund.processed": "Remboursement traité",
  "refund.failed": "Remboursement échoué",
  "partial_payment.created": "Paiement partiel créé",
  "partial_payment.paid": "Paiement partiel effectué",
  "installment.paid": "Échéance payée",
  "payout.created": "Paiement créé",
  "payout.processed": "Paiement traité",
  "payout.failed": "Paiement échoué",
  "webhook.received": "Webhook reçu",
  "webhook.processed": "Webhook traité",
  "provider.sync": "Synchronisation fournisseur",
};

export function PaymentAuditLog({ paymentId }: PaymentAuditLogProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isFetching } = trpc.payments.adminAuditLogs.useQuery({
    transaction_id: paymentId,
    page,
    limit,
  });

  if (isFetching && !data) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Aucun journal d'audit trouvé.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative space-y-0">
        {data.items.map((log, idx) => (
          <div key={log.id} className="flex gap-4 pb-4">
            <div className="flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ring-2 ${
                  log.action.includes("failed") || log.action.includes("rejected")
                    ? "bg-red-500 ring-red-200"
                    : log.action.includes("created") || log.action.includes("captured") || log.action.includes("paid") || log.action.includes("processed") || log.action.includes("approved")
                      ? "bg-green-500 ring-green-200"
                      : "bg-blue-500 ring-blue-200"
                }`}
              />
              {idx < data.items.length - 1 && (
                <div className="mt-1 h-full w-px bg-border" />
              )}
            </div>
            <div className="flex-1 space-y-1 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {log.actor_name && (
                  <Badge variant="secondary" className="text-xs">
                    {log.actor_name}
                  </Badge>
                )}
                {log.actor_user_id && !log.actor_name && (
                  <Badge variant="secondary" className="text-xs">
                    {log.actor_user_id.slice(0, 8)}...
                  </Badge>
                )}
                {log.from_status && log.to_status && (
                  <span>
                    {log.from_status} → {log.to_status}
                  </span>
                )}
                {log.resource_type && (
                  <span className="capitalize">{log.resource_type.replace(/_/g, " ")}</span>
                )}
                {log.ip_address && <span>IP: {log.ip_address}</span>}
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <pre className="mt-1 rounded bg-muted p-2 text-xs overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-xs text-muted-foreground">
            Page {data.meta.page} sur {data.meta.total_pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
