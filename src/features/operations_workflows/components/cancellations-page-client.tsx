"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "./simple-data-table";
import { XCircle, CheckCircle2, Clock } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  approved: "destructive",
  rejected: "default",
};

const reason_labels: Record<string, string> = {
  customer_request: "Demande client",
  payment_issue: "Problème de paiement",
  out_of_stock: "Rupture de stock",
  fraud: "Fraude",
  duplicate: "Doublon",
  other: "Autre",
};

export function CancellationsPageClient() {
  const { data, isLoading } = trpc.operations.orderListCancellationRequests.useQuery({ page: 1, limit: 20 });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demandes d&apos;annulation</h1>
          <p className="text-muted-foreground">Gérer les demandes d&apos;annulation de commandes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((r) => r.status === "pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((r) => r.status === "approved").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((r) => r.status === "rejected").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              { accessorKey: "order_id", header: "Commande" },
              {
                accessorKey: "reason",
                header: "Motif",
                cell: ({ row }) => reason_labels[row.original.reason as string] ?? row.original.reason,
              },
              {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => (
                  <Badge variant={status_badges[row.original.status as string]}>
                    {status_labels[row.original.status as string] ?? row.original.status}
                  </Badge>
                ),
              },
              { accessorKey: "review_note", header: "Note de révision" },
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
