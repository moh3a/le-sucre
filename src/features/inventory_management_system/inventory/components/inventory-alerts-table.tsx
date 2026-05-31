"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { useDataTable } from "@/features/data-table/use-data-table";
import { estimate_page_count } from "@/lib/console-table";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";

type AlertRow = {
  id: string;
  sku_id: string;
  alert_type: string;
  status: string;
  message: string | null;
};

export function InventoryAlertsTable() {
  const utils = trpc.useUtils();
  const ack = trpc.forecast.ackAlert.useMutation({
    onSuccess: () => utils.forecast.alerts.invalidate(),
  });
  const resolve = trpc.forecast.resolveAlert.useMutation({
    onSuccess: () => utils.forecast.alerts.invalidate(),
  });

  const columns = React.useMemo<ColumnDef<AlertRow>[]>(
    () => [
      {
        id: "sku_id",
        accessorKey: "sku_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="SKU" />,
      },
      {
        id: "alert_type",
        accessorKey: "alert_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
      },
      {
        id: "message",
        accessorKey: "message",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Message" />,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => ack.mutate({ id: row.original.id })}>
              Accuser
            </Button>
            <Button size="sm" onClick={() => resolve.mutate({ id: row.original.id })}>
              Résoudre
            </Button>
          </div>
        ),
      },
    ],
    [ack, resolve],
  );

  const [page] = useQueryState("alertPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("alertPerPage", parseAsInteger.withDefault(20));

  const { data, isLoading } = trpc.forecast.alerts.useQuery({
    page,
    limit: per_page,
    status: "open",
  });
  const items = (data ?? []) as AlertRow[];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: estimate_page_count(page, per_page, items.length),
    queryKeys: { page: "alertPage", perPage: "alertPerPage" },
    getRowId: (row) => row.id,
  });

  if (isLoading) return null;

  return <DataTable table={table} />;
}
