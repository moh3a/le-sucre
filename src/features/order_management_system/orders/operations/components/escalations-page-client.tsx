"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { AlertCircle, CheckCircle, Clock, Eye } from "lucide-react";

const status_labels: Record<string, string> = {
  open: "Ouvert",
  in_review: "En révision",
  resolved: "Résolu",
  dismissed: "Rejeté",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  open: "destructive",
  in_review: "secondary",
  resolved: "default",
  dismissed: "outline",
};

const priority_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  urgent: "destructive",
  high: "destructive",
  normal: "secondary",
  low: "outline",
};

export function EscalationsPageClient() {
  const { data, isLoading } = trpc.operations.orderListEscalations.useQuery({ page: 1, limit: 20 });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalades</h1>
          <p className="text-muted-foreground">Gestion des escalades de commandes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouvertes</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((e) => e.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En révision</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((e) => e.status === "in_review").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((e) => e.status === "resolved").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta?.total_records ?? 0}</div>
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
                cell: ({ row }) => {
                  const labels: Record<string, string> = {
                    payment_dispute: "Litige paiement",
                    customer_complaint: "Réclamation client",
                    delivery_issue: "Problème livraison",
                    technical: "Technique",
                    other: "Autre",
                  };
                  return labels[row.original.reason as string] ?? row.original.reason;
                },
              },
              {
                accessorKey: "priority",
                header: "Priorité",
                cell: ({ row }) => (
                  <Badge variant={priority_badges[row.original.priority as string]}>
                    {row.original.priority as string}
                  </Badge>
                ),
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
