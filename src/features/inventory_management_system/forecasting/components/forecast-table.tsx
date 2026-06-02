"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";

type ForecastRow = {
  sku_id: string;
  sku_code: string;
  avg_daily_sales: number;
  days_until_stockout: number;
  recommended_reorder_qty: number;
  risk_level: string;
  computed_at: string;
};

const RISK_BADGES: Record<
  string,
  { label: string; variant: "destructive" | "warning" | "secondary" | "default" }
> = {
  critical: { label: "Critique", variant: "destructive" },
  high: { label: "Élevé", variant: "warning" },
  normal: { label: "Normal", variant: "default" },
  low: { label: "Faible", variant: "secondary" },
};

export function ForecastTable({ data }: { data: ForecastRow[] }) {
  const columns = React.useMemo<ColumnDef<ForecastRow>[]>(
    () => [
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Code SKU" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.original.sku_code}</span>,
      },
      {
        id: "risk_level",
        accessorKey: "risk_level",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Niveau de Risque" />,
        cell: ({ row }) => {
          const cfg = RISK_BADGES[row.original.risk_level] ?? {
            label: row.original.risk_level,
            variant: "outline",
          };
          return (
            <Badge variant={cfg.variant === "warning" ? "outline" : cfg.variant}>{cfg.label}</Badge>
          );
        },
      },
      {
        id: "avg_daily_sales",
        accessorKey: "avg_daily_sales",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Ventes Journalières Moyennes" />
        ),
        cell: ({ row }) => Number(row.original.avg_daily_sales).toFixed(2),
      },
      {
        id: "days_until_stockout",
        accessorKey: "days_until_stockout",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Jours Avant Rupture" />
        ),
        cell: ({ row }) => {
          const days = row.original.days_until_stockout;
          if (days === null || days === undefined) return "—";
          return days <= 0 ? (
            <span className="text-destructive font-bold">En rupture (0)</span>
          ) : (
            <span
              className={
                days < 10
                  ? "text-destructive font-semibold"
                  : days < 30
                    ? "text-warning font-semibold"
                    : ""
              }
            >
              {days} jours
            </span>
          );
        },
      },
      {
        id: "recommended_reorder_qty",
        accessorKey: "recommended_reorder_qty",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Qte Réappro. Recommandée" />
        ),
        cell: ({ row }) => row.original.recommended_reorder_qty.toLocaleString("fr-FR"),
      },
      {
        id: "computed_at",
        accessorKey: "computed_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date de Calcul" />,
        cell: ({ row }) =>
          new Date(row.original.computed_at).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "fcPage", perPage: "fcPerPage" },
    getRowId: (row) => row.sku_id,
  });

  return <DataTable table={table} />;
}
