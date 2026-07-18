"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Download } from "lucide-react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Button } from "@/components/ui/button";

type SearchRow = {
  query: string;
  count: number;
};

export function AnalyticsSearches({ from, to }: { from: string; to: string }) {
  const t = useTranslations("analytics");
  const { data, isLoading } = trpc.analytics.searchAnalytics.useQuery({ from, to, limit: 50 });

  const columns = React.useMemo<ColumnDef<SearchRow>[]>(
    () => [
      {
        id: "query",
        accessorKey: "query",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_search_query")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium">
            <Search className="text-muted-foreground size-4" />
            <span>{row.original.query}</span>
          </div>
        ),
      },
      {
        id: "count",
        accessorKey: "count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_search_volume")} />
        ),
        cell: ({ row }) => row.original.count.toLocaleString("fr-FR"),
      },
    ],
    [t],
  );

  const items = (data?.top_searches ?? []) as SearchRow[];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: 1,
    queryKeys: { page: "srPage", perPage: "srPerPage", sort: "srSort" },
    getRowId: (row) => row.query,
  });

  function handleExport() {
    const rows = table.getFilteredRowModel().rows;
    const header = [t("col_search_query"), t("col_search_volume")].join(",");
    const csvRows = rows.map((r) => `"${r.original.query}",${r.original.count}`);
    const blob = new Blob([header, "\n", ...csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-searches-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={2} rowCount={10} />}
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
