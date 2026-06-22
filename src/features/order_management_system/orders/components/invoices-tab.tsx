"use client";

import { FileText } from "lucide-react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type InvoicesTabProps = {
  order_id: string;
};

export function InvoicesTab({ order_id }: InvoicesTabProps) {
  const { data: invoices_data, refetch: refetch_invoices } =
    trpc.invoices.list_by_order.useQuery({ order_id }, { enabled: !!order_id });

  const generate_invoice = trpc.invoices.generate_invoice.useMutation({
    onSuccess: () => {
      refetch_invoices();
      toast.success("Facture générée avec succès");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const mark_invoice_paid = trpc.invoices.mark_as_paid.useMutation({
    onSuccess: () => {
      refetch_invoices();
      toast.success("Facture marquée comme payée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const void_invoice = trpc.invoices.void_invoice.useMutation({
    onSuccess: () => {
      refetch_invoices();
      toast.success("Facture annulée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  return (
    <QueryGuard query={{ isLoading: !invoices_data }} mutation={{ isPending: generate_invoice.isPending }}>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Factures liées</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generate_invoice.mutate({ order_id })}
          disabled={generate_invoice.isPending}
        >
          <FileText className="mr-1 h-3 w-3" />
          Générer une facture
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {!invoices_data || invoices_data.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm">Aucune facture pour cette commande.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">N° Facture</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3 text-right font-medium">Montant</th>
                <th className="px-4 py-3 text-left font-medium">Créée le</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices_data.map((inv) => {
                const type_label =
                  inv.type === "order_invoice"
                    ? "Facture"
                    : inv.type === "refund_invoice"
                      ? "Remboursement"
                      : "Avoir";
                const status_label =
                  inv.status === "unpaid"
                    ? "Impayée"
                    : inv.status === "paid"
                      ? "Payée"
                      : inv.status === "void"
                        ? "Annulée"
                        : inv.status === "refunded"
                          ? "Remboursée"
                          : "Partiellement remboursée";
                const status_variant: Record<string, "default" | "secondary" | "destructive" | "outline"> =
                  { unpaid: "outline", paid: "default", void: "destructive", refunded: "secondary", partially_refunded: "secondary" };
                return (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-xs">{type_label}</td>
                    <td className="px-4 py-3">
                      <Badge variant={status_variant[inv.status] ?? "outline"}>
                        {status_label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {Number(inv.grand_total).toLocaleString("fr-FR")} DZD
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-xs">
                      {formatDate(inv.created_at, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() =>
                            window.open(`/api/admin/invoices/${inv.id}/download`, "_blank")
                          }
                        >
                          Voir
                        </Button>
                        {inv.status === "unpaid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => mark_invoice_paid.mutate({ id: inv.id })}
                            disabled={mark_invoice_paid.isPending}
                          >
                            Marquer payée
                          </Button>
                        )}
                        {(inv.status === "unpaid" || inv.status === "paid") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-red-500"
                            onClick={() => void_invoice.mutate({ id: inv.id })}
                            disabled={void_invoice.isPending}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
