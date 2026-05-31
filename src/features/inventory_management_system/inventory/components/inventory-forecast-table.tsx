"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { useDataTable } from "@/hooks/use-data-table";
import { estimate_page_count } from "@/lib/console-table";

type ForecastRow = {
  sku_id: string;
  sku_code: string | null;
  avg_daily_sales: string | null;
  days_until_stockout: number | null;
  recommended_reorder_qty: number | null;
  risk_level: string | null;
};

// TODO Extend columns: current_stock, reserved_stock, days_until_stockout, recommended_reorder_qty.
export function InventoryForecastTable() {
  const columns = React.useMemo<ColumnDef<ForecastRow>[]>(
    () => [
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label="SKU" />,
      },
      {
        id: "avg_daily_sales",
        accessorKey: "avg_daily_sales",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Ventes/j" />,
      },
      {
        id: "days_until_stockout",
        accessorKey: "days_until_stockout",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Jours restants" />,
      },
      {
        id: "recommended_reorder_qty",
        accessorKey: "recommended_reorder_qty",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Réappro." />,
      },
      {
        id: "risk_level",
        accessorKey: "risk_level",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Risque" />,
        cell: ({ row }) => <Badge variant="secondary">{row.original.risk_level ?? "—"}</Badge>,
      },
    ],
    [],
  );

  const [page] = useQueryState("invPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("invPerPage", parseAsInteger.withDefault(20));

  const { data, isLoading } = trpc.forecast.dashboard.useQuery({ page, limit: per_page });
  const items = (data ?? []) as ForecastRow[];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: estimate_page_count(page, per_page, items.length),
    queryKeys: { page: "invPage", perPage: "invPerPage" },
    getRowId: (row) => row.sku_id,
  });

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={10} />;

  return <DataTable table={table} />;
}
