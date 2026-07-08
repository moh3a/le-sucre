"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Search, ToggleLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useTranslations } from "next-intl";
import { DataTable } from "@/features/data-table/components/data-table";
import { QueryGuard } from "@/components/query-guard";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FacetedFilter } from "@/features/data-table/components/data-table-faceted-filter-simple";
import type { InventoryStockRow } from "../repositories/inventory-admin.repository";
import { InventoryStockDialog } from "./inventory-stock-dialog";

const LOW_STOCK_THRESHOLD = 5;

export function InventoryStockTable() {
  const t = useTranslations("inventory");
  const [page] = useQueryState("stkPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("stkPerPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("stkSearch", parseAsString);
  const [stock_filter, setStockFilter] = useQueryState("stkFilter", parseAsString);
  const [selected_sku, set_selected_sku] = React.useState<InventoryStockRow | null>(null);

  const columns = React.useMemo<ColumnDef<InventoryStockRow>[]>(
    () => [
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("sku_column")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/products/${row.original.product_id}`}
            className="font-mono text-sm font-medium hover:underline"
          >
            {row.original.sku_code}
          </Link>
        ),
      },
      {
        id: "product_name",
        accessorKey: "product_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("product_column")} />,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.product_name ?? "—"}</span>
        ),
      },
      {
        id: "warehouse_id",
        accessorKey: "warehouse_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("warehouse_column")} />,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.warehouse_id}
          </Badge>
        ),
      },
      {
        id: "quantity_on_hand",
        accessorKey: "quantity_on_hand",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("in_stock_column")} />,
        cell: ({ row }) => {
          const qty = row.original.quantity_on_hand;
          const is_low = qty > 0 && qty <= LOW_STOCK_THRESHOLD;
          return (
            <Badge variant={qty === 0 ? "destructive" : is_low ? "secondary" : "default"}>
              {qty}
            </Badge>
          );
        },
      },
      {
        id: "quantity_reserved",
        accessorKey: "quantity_reserved",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("reserved_column")} />,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.quantity_reserved}</span>
        ),
      },
      {
        id: "stock_available",
        accessorKey: "stock_available",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("available_column")} />,
        cell: ({ row }) => {
          const available = row.original.stock_available;
          return (
            <span className={`text-sm font-medium ${available === 0 ? "text-destructive" : ""}`}>
              {available}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: t("actions"),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => set_selected_sku(row.original)}
            className="text-sm text-primary hover:underline"
          >
            {t("set_quantity")}
          </button>
        ),
      },
    ],
    [t],
  );

  const low_stock = stock_filter === "low";
  const out_of_stock = stock_filter === "out";

  const { data, isLoading } = trpc.inventory.adminListStock.useQuery({
    page,
    limit: per_page,
    search: search ?? undefined,
    low_stock: low_stock || undefined,
    out_of_stock: out_of_stock || undefined,
  });

  const items = (data?.items ?? []) as InventoryStockRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 0,
    queryKeys: { page: "stkPage", perPage: "stkPerPage" },
    getRowId: (row) => row.sku_id,
  });

  const stockFilterOptions = [
    { label: t("out_of_stock"), value: "out" },
    { label: t("low_stock"), value: "low" },
  ];

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t("search_placeholder")}
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value || null)}
              className="max-w-xs pl-8"
            />
          </div>
          <FacetedFilter
            title={t("filter_title")}
            options={stockFilterOptions}
            icon={ToggleLeft}
            value={stock_filter}
            onChange={setStockFilter}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>

      {selected_sku && (
        <InventoryStockDialog
          row={selected_sku}
          open={!!selected_sku}
          onOpenChange={(open) => {
            if (!open) set_selected_sku(null);
          }}
        />
      )}
    </QueryGuard>
  );
}
