"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Link2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format_currency } from "@/lib/format";

type ProductRow = {
  product_id: string;
  name: string;
  units_sold: number;
  revenue: string;
  views: number;
};

export function AnalyticsProductsTab({ from, to }: { from: string; to: string }) {
  const t = useTranslations("analytics");
  const { data, isLoading } = trpc.analytics.products.useQuery({
    from,
    to,
    limit: 100,
    sort: "revenue",
  });

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_product")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/console/products/${row.original.product_id}`}
              className="text-primary hover:underline font-medium"
            >
              {row.original.name}
            </Link>
            <Link href={`/console/products/${row.original.product_id}`}>
              <Link2 className="text-muted-foreground size-3" />
            </Link>
          </div>
        ),
      },
      {
        id: "views",
        accessorKey: "views",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_views")} />
        ),
        cell: ({ row }) => row.original.views.toLocaleString("fr-FR"),
      },
      {
        id: "units_sold",
        accessorKey: "units_sold",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_units_sold")} />
        ),
        cell: ({ row }) => row.original.units_sold.toLocaleString("fr-FR"),
      },
      {
        id: "revenue",
        accessorKey: "revenue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_revenue")} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {format_currency(Number(row.original.revenue), "DZD", 0)}
          </Badge>
        ),
      },
      {
        id: "conversion_rate",
        accessorFn: (row) => (row.views > 0 ? (row.units_sold / row.views) * 100 : 0),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_conversion")} />
        ),
        cell: ({ row }) => {
          const rate =
            row.original.views > 0
              ? (row.original.units_sold / row.original.views) * 100
              : 0;
          return `${rate.toFixed(1)}%`;
        },
      },
    ],
    [t],
  );

  const items = (data?.best_sellers ?? []) as ProductRow[];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: 1,
    queryKeys: { page: "apPage", perPage: "apPerPage", sort: "apSort" },
    getRowId: (row) => row.product_id,
  });

  function handleExport() {
    const rows = table.getFilteredRowModel().rows;
    const header = [t("col_product"), t("col_views"), t("col_units_sold"), t("col_revenue"), t("col_conversion")].join(",");
    const csvRows = rows.map((r) => {
      const rate = r.original.views > 0 ? ((r.original.units_sold / r.original.views) * 100).toFixed(1) : "0.0";
      return [
        `"${r.original.name}"`,
        r.original.views,
        r.original.units_sold,
        Number(r.original.revenue).toFixed(2),
        rate,
      ].join(",");
    });
    const blob = new Blob([header, "\n", ...csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-products-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 size-4" />
            {t("export_csv")}
          </Button>
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </QueryGuard>
  );
}
