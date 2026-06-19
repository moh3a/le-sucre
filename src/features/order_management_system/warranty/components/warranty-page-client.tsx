"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { Wrench, Clock } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  under_review: "En révision",
  approved: "Approuvé",
  rejected: "Rejeté",
  in_repair: "En réparation",
  repaired: "Réparé",
  replaced: "Remplacé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  under_review: "secondary",
  approved: "default",
  rejected: "destructive",
  in_repair: "secondary",
  repaired: "default",
  replaced: "default",
  completed: "default",
  cancelled: "destructive",
};

export function WarrantyPageClient() {
  const { data, isLoading } = trpc.operations.warrantyList.useQuery({ page: 1, limit: 20 });
  const stats = trpc.operations.warrantyStats.useQuery();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Garanties</h1>
          <p className="text-muted-foreground">Gestion des demandes de garantie</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.data?.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En révision</CardTitle>
            <Wrench className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.data?.under_review ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              { accessorKey: "order_id", header: "Commande" },
              { accessorKey: "issue_type", header: "Type de problème" },
              {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => (
                  <Badge variant={status_badges[row.original.status as string]}>
                    {status_labels[row.original.status as string] ?? row.original.status}
                  </Badge>
                ),
              },
              { accessorKey: "resolution_type", header: "Résolution" },
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
