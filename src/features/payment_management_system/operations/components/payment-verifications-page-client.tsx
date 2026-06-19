"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { Banknote, Clock, CheckCircle2, XCircle } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  verified: "Vérifié",
  rejected: "Rejeté",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  verified: "default",
  rejected: "destructive",
};

export function PaymentVerificationsPageClient() {
  const { data, isLoading } = trpc.operations.paymentListVerifications.useQuery({ page: 1, limit: 20 });
  const pendingCount = trpc.operations.paymentCountPendingVerifications.useQuery();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vérifications de paiement</h1>
          <p className="text-muted-foreground">Vérification manuelle des paiements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount.data ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifiées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((v) => v.status === "verified").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((v) => v.status === "rejected").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              { accessorKey: "order_id", header: "Commande" },
              { accessorKey: "amount", header: "Montant" },
              { accessorKey: "reference_number", header: "Référence" },
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
            data={items}
            pageCount={data?.meta?.total_pages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
