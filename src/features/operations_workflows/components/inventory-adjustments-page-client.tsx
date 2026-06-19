"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "./simple-data-table";
import { Warehouse, Clock, CheckCircle2, XCircle } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  cancelled: "Annulé",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  cancelled: "destructive",
};

const type_labels: Record<string, string> = {
  increase: "Augmentation",
  decrease: "Diminution",
  damage: "Dommage",
  loss: "Perte",
  correction: "Correction",
};

export function InventoryAdjustmentsPageClient() {
  const { data, isLoading } = trpc.operations.inventoryListAdjustmentRequests.useQuery({ page: 1, limit: 20 });
  const stats = trpc.operations.inventoryAdjustmentStats.useQuery();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajustements de stock</h1>
          <p className="text-muted-foreground">Demandes d&apos;ajustement d&apos;inventaire</p>
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
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.data?.approved ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              { accessorKey: "sku_id", header: "SKU" },
              {
                accessorKey: "adjustment_type",
                header: "Type",
                cell: ({ row }) => type_labels[row.original.adjustment_type as string] ?? row.original.adjustment_type,
              },
              { accessorKey: "quantity_delta", header: "Quantité" },
              { accessorKey: "reason", header: "Motif" },
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
