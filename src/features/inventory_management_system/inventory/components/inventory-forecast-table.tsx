"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import * as React from "react";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";

type ForecastRow = {
  sku_id: string;
  sku_code: string | null;
  avg_daily_sales: string | null;
  days_until_stockout: number | null;
  recommended_reorder_qty: number | null;
  risk_level: string | null;
  current_stock: number | null;
  reserved_stock: number | null;
};

export function InventoryForecastTable() {
  const t = useTranslations("forecast");
  const RISK_BADGES: Record<
    string,
    { label: string; variant: "destructive" | "warning" | "secondary" | "default" }
  > = {
    critical: { label: t("critical"), variant: "destructive" },
    high: { label: t("high"), variant: "warning" },
    normal: { label: t("normal"), variant: "default" },
    low: { label: t("low"), variant: "secondary" },
  };
  const columns = React.useMemo<ColumnDef<ForecastRow>[]>(
    () => [
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Code SKU" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.original.sku_code ?? "—"}</span>,
      },
      {
        id: "current_stock",
        accessorKey: "current_stock",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Stock Actuel" />,
        cell: ({ row }) => (row.original.current_stock ?? 0).toLocaleString("fr-FR"),
      },
      {
        id: "reserved_stock",
        accessorKey: "reserved_stock",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Réservé" />,
        cell: ({ row }) => (row.original.reserved_stock ?? 0).toLocaleString("fr-FR"),
      },
      {
        id: "avg_daily_sales",
        accessorKey: "avg_daily_sales",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Ventes/j" />,
        cell: ({ row }) => Number(row.original.avg_daily_sales || 0).toFixed(2),
      },
      {
        id: "days_until_stockout",
        accessorKey: "days_until_stockout",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Jours restants" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Réappro." />,
        cell: ({ row }) => (row.original.recommended_reorder_qty ?? 0).toLocaleString("fr-FR"),
      },
      {
        id: "risk_level",
        accessorKey: "risk_level",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Risque" />,
        cell: ({ row }) => {
          const risk = row.original.risk_level;
          if (!risk) return "—";
          const cfg = RISK_BADGES[risk] ?? {
            label: risk,
            variant: "outline",
          };
          return (
            <Badge variant={cfg.variant === "warning" ? "outline" : cfg.variant}>{cfg.label}</Badge>
          );
        },
      },
    ],
    [],
  );

  const [page] = useQueryState("invPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("invPerPage", parseAsInteger.withDefault(20));

  const { data, isLoading } = trpc.forecast.dashboard.useQuery({ page, limit: per_page });
  const items = (data?.items ?? []) as ForecastRow[];
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: page_count,
    queryKeys: { page: "invPage", perPage: "invPerPage" },
    getRowId: (row) => row.sku_id,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
      <DataTable table={table} />
    </QueryGuard>
  );
}
