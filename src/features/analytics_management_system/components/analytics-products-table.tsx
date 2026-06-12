"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { trpc } from "@/components/providers/app-providers";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { default_range } from "../helpers/default-range";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type ProductRow = {
  product_id: string;
  name: string;
  units_sold: number;
  revenue: string;
  views: number;
};

export function AnalyticsProductsTable() {
  const { from, to } = default_range();
  const { data, isLoading } = trpc.analytics.products.useQuery({
    from,
    to,
    limit: 20,
    sort: "revenue",
  });

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Produit" />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "views",
        accessorKey: "views",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Vues" />,
        cell: ({ row }) => row.original.views.toLocaleString("fr-FR"),
      },
      {
        id: "units_sold",
        accessorKey: "units_sold",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Unités vendues" />,
        cell: ({ row }) => row.original.units_sold.toLocaleString("fr-FR"),
      },
      {
        id: "revenue",
        accessorKey: "revenue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Chiffre d'affaires" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {Number(row.original.revenue).toLocaleString("fr-FR", {
              style: "currency",
              currency: "DZD",
              maximumFractionDigits: 0,
            })}
          </Badge>
        ),
      },
    ],
    [],
  );

  const items = (data?.best_sellers ?? []) as ProductRow[];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: 1,
    queryKeys: { page: "apPage", perPage: "apPerPage" },
    getRowId: (row) => row.product_id,
  });

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meilleures ventes</CardTitle>
        <CardDescription>Meilleures ventes sur les 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable table={table} />
      </CardContent>
    </Card>
  );
}
