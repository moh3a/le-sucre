"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ToggleLeft } from "lucide-react";
import * as React from "react";

import { useTranslations } from "next-intl";
import { DataTable } from "@/features/data-table/components/data-table";
import { QueryGuard } from "@/components/query-guard";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DateRangeFilter } from "@/features/data-table/components/data-table-date-range-filter";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { FacetedFilter } from "@/features/data-table/components/data-table-faceted-filter-simple";
import type { InventoryMovementRow } from "../repositories/inventory-admin.repository";
import { getMovementLabels } from "../constants/movement-types";

const MOVEMENT_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  adjust: "outline",
  receive: "default",
  sale: "destructive",
  reserve: "secondary",
  release: "outline",
  preorder_allocate: "secondary",
  preorder_fulfill: "default",
};

export function InventoryMovementsTable() {
  const t = useTranslations("inventory");
  const ml = getMovementLabels(t);
  const [page] = useQueryState("movPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("movPerPage", parseAsInteger.withDefault(10));
  const [movement_type, set_movement_type] = useQueryState("movType", parseAsString);
  const [from, setFrom] = useQueryState("movFrom", parseAsString);
  const [to, setTo] = useQueryState("movTo", parseAsString);

  const columns = React.useMemo<ColumnDef<InventoryMovementRow>[]>(
    () => [
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date")} />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "movement_type",
        accessorKey: "movement_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("type")} />,
        cell: ({ row }) => (
          <Badge variant={MOVEMENT_BADGE[row.original.movement_type] ?? "outline"}>
            {ml[row.original.movement_type] ?? row.original.movement_type}
          </Badge>
        ),
      },
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("sku")} />,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.sku_code ?? "—"}</span>
        ),
      },
      {
        id: "product_name",
        accessorKey: "product_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("product_column")} />,
        cell: ({ row }) => <span className="text-sm">{row.original.product_name ?? "—"}</span>,
      },
      {
        id: "quantity_delta",
        accessorKey: "quantity_delta",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("quantity")} />,
        cell: ({ row }) => {
          const delta = row.original.quantity_delta;
          return (
            <span
              className={`font-mono text-sm font-medium ${delta < 0 ? "text-destructive" : "text-green-600"}`}
            >
              {delta >= 0 ? "+" : ""}
              {delta}
            </span>
          );
        },
      },
      {
        id: "warehouse_id",
        accessorKey: "warehouse_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("warehouse")} />,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.warehouse_id}
          </Badge>
        ),
      },
      {
        id: "reference_type",
        accessorKey: "reference_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("ref_type")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {row.original.reference_type ?? "—"}
          </span>
        ),
      },
    ],
    [t, ml],
  );

  const { data, isLoading } = trpc.inventory.adminListMovements.useQuery({
    page,
    limit: per_page,
    movement_type: movement_type ?? undefined,
    from: from ?? undefined,
    to: to ?? undefined,
  });

  const items = (data?.items ?? []) as InventoryMovementRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 0,
    queryKeys: { page: "movPage", perPage: "movPerPage" },
    getRowId: (row) => row.id,
  });

  const movementTypeOptions = Object.keys(ml).map((key) => ({
    value: key,
    label: ml[key],
  }));

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
      <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title={t("type")}
          options={movementTypeOptions}
          icon={ToggleLeft}
          value={movement_type}
          onChange={set_movement_type}
        />
        <DateRangeFilter
          title={t("date")}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
    </QueryGuard>
  );
}
