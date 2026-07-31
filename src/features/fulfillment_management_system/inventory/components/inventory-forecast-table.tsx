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
    { label: string; variant: "destructive" | "outline" | "secondary" | "default" }
  > = React.useMemo(
    () => ({
      critical: { label: t("risk_critical"), variant: "destructive" },
      high: { label: t("risk_high"), variant: "secondary" },
      normal: { label: t("risk_normal"), variant: "default" },
      low: { label: t("risk_low"), variant: "outline" },
    }),
    [t],
  );
  const columns = React.useMemo<ColumnDef<ForecastRow>[]>(
    () => [
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("sku_code_column")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.original.sku_code ?? "—"}</span>
        ),
      },
      {
        id: "current_stock",
        accessorKey: "current_stock",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("current_stock_column")} />
        ),
        cell: ({ row }) => (row.original.current_stock ?? 0).toLocaleString(),
      },
      {
        id: "reserved_stock",
        accessorKey: "reserved_stock",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("reserved_column")} />
        ),
        cell: ({ row }) => (row.original.reserved_stock ?? 0).toLocaleString(),
      },
      {
        id: "avg_daily_sales",
        accessorKey: "avg_daily_sales",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("sales_per_day_column")} />
        ),
        cell: ({ row }) => Number(row.original.avg_daily_sales || 0).toFixed(2),
      },
      {
        id: "days_until_stockout",
        accessorKey: "days_until_stockout",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("days_remaining_column")} />
        ),
        cell: ({ row }) => {
          const days = row.original.days_until_stockout;
          if (days === null || days === undefined) return "—";
          return days <= 0 ? (
            <span className="text-destructive font-bold">{t("risk_critical")} (0)</span>
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
              {days} {t("days_remaining_column")}
            </span>
          );
        },
      },
      {
        id: "recommended_reorder_qty",
        accessorKey: "recommended_reorder_qty",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("reorder_column")} />
        ),
        cell: ({ row }) => (row.original.recommended_reorder_qty ?? 0).toLocaleString(),
      },
      {
        id: "risk_level",
        accessorKey: "risk_level",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("risk_column")} />,
        cell: ({ row }) => {
          const risk = row.original.risk_level;
          if (!risk) return "—";
          const cfg = RISK_BADGES[risk] ?? {
            label: risk,
            variant: "outline" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
    ],
    [RISK_BADGES, t],
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
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}
    >
      <DataTable table={table} />
    </QueryGuard>
  );
}
