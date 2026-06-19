"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { RefreshCw } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  processing: "En cours",
  completed: "Terminé",
  failed: "Échoué",
  rejected: "Rejeté",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  approved: "secondary",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
  rejected: "destructive",
};

export function RefundsPageClient() {
  const { data, isLoading } = trpc.operations.paymentListRefundRequests.useQuery({ page: 1, limit: 20 });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Remboursements</h1>
          <p className="text-muted-foreground">Gestion des demandes de remboursement</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              { accessorKey: "order_id", header: "Commande" },
              { accessorKey: "amount", header: "Montant" },
              { accessorKey: "refund_method", header: "Méthode" },
              {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => (
                  <Badge variant={status_badges[row.original.status as string]}>
                    {status_labels[row.original.status as string] ?? row.original.status}
                  </Badge>
                ),
              },
              { accessorKey: "created_at", header: "Date" },
            ]}
            data={data?.items ?? []}
            pageCount={data?.meta?.total_pages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
