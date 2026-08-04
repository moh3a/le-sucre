"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

type PreorderSettingsRow = {
  sku_id: string;
  sku_code: string | null;
  product_name: string | null;
  is_preorder_enabled: boolean;
  allow_backorder: boolean;
  max_preorder_qty: number | null;
  preorder_sold: number;
  estimated_available_at: string | null;
  deposit_percent: number;
  lead_time_days: number;
  is_active: boolean;
  updated_at: string;
};

export function PreorderSettingsTable() {
  const t = useTranslations("preorders");
  const [page, setPage] = useQueryState("psPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("psPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("psSearch", parseAsString);

  const { data, isLoading } = trpc.preorders.adminListSettings.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
  });

  const columns = React.useMemo<ColumnDef<PreorderSettingsRow>[]>(
    () => [
      {
        id: "product",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("product_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {row.original.product_name ?? t("storefront_product_default")}
            </span>
            <span className="text-muted-foreground font-mono text-xs">
              {row.original.sku_code ?? row.original.sku_id}
            </span>
          </div>
        ),
      },
      {
        id: "mode",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("mode_column")} />
        ),
        cell: ({ row }) => {
          const s = row.original;
          if (!s.is_active) {
            return <Badge variant="outline">{t("inactive_badge")}</Badge>;
          }
          if (s.is_preorder_enabled) {
            return <Badge variant="default">{t("preorder_badge")}</Badge>;
          }
          if (s.allow_backorder) {
            return <Badge variant="secondary">{t("backorder_badge")}</Badge>;
          }
          return <Badge variant="outline">{t("standard_badge")}</Badge>;
        },
      },
      {
        id: "deposit_percent",
        accessorKey: "deposit_percent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("deposit_column")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.is_preorder_enabled
              ? `${Math.round(row.original.deposit_percent)}%`
              : "—"}
          </span>
        ),
      },
      {
        id: "lead_time_days",
        accessorKey: "lead_time_days",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("lead_time_column")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.is_preorder_enabled ? `${row.original.lead_time_days}j` : "—"}
          </span>
        ),
      },
      {
        id: "max_preorder_qty",
        accessorKey: "max_preorder_qty",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("max_qty_column")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.max_preorder_qty != null ? row.original.max_preorder_qty : t("max_qty_unlimited")}
          </span>
        ),
      },
      {
        id: "estimated_available_at",
        accessorKey: "estimated_available_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("eta_column")} />
        ),
        cell: ({ row }) => {
          const eta = row.original.estimated_available_at;
          return (
            <span className="text-xs">
              {eta ? formatDate(eta, { month: "short" }) : "—"}
            </span>
          );
        },
      },
      {
        id: "preorder_sold",
        accessorKey: "preorder_sold",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("sold")} />
        ),
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.preorder_sold}</span>,
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("active_column")} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? t("active") : t("inactive")}
          </Badge>
        ),
      },
      {
        id: "updated_at",
        accessorKey: "updated_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("updated_column")} />
        ),
        cell: ({ row }) => formatDate(row.original.updated_at, { month: "short" }),
      },
    ],
    [t],
  );

  const items = (data?.items ?? []) as PreorderSettingsRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "psPage", perPage: "psPerPage", sort: "psSort" },
    getRowId: (row) => row.sku_id,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_placeholder")}
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </QueryGuard>
  );
}
