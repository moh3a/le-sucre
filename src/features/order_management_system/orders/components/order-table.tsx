"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ReceiptCent, ToggleLeft } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: string;
  guest_email: string | null;
  created_at: string;
};

export function OrderTable({ compact = false }: { compact?: boolean }) {
  const columns = React.useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        id: "order_number",
        accessorKey: "order_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label="N° commande" />,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
        meta: {
          label: "Statut",
          variant: "select",
          icon: ToggleLeft,
          options: [
            { label: "pending_payment", value: "pending_payment" },
            { label: "paid", value: "paid" },
            { label: "fulfilled", value: "fulfilled" },
            { label: "cancelled", value: "cancelled" },
          ],
        },
        enableColumnFilter: !compact,
      },
      {
        id: "payment_status",
        accessorKey: "payment_status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Paiement" />,
      },
      {
        id: "grand_total",
        accessorKey: "grand_total",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Total" />,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
        meta: { label: "Date", icon: ReceiptCent },
      },
    ],
    [compact],
  );

  const [page] = useQueryState("ordPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("ordPerPage", parseAsInteger.withDefault(compact ? 5 : 10));
  const [status_filter] = useQueryState("status", parseAsArrayOf(parseAsString, ","));
  const status = status_filter?.[0];

  const { data, isLoading } = trpc.orders.adminList.useQuery({
    page,
    limit: per_page,
    status,
  });

  const items = (data?.items ?? []) as OrderRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 0,
    queryKeys: { page: "ordPage", perPage: "ordPerPage" },
    getRowId: (row) => row.id,
  });

  if (isLoading && !data) return <DataTableSkeleton columnCount={5} rowCount={compact ? 5 : 10} />;

  return (
    <DataTable table={table}>{!compact ? <DataTableToolbar table={table} /> : null}</DataTable>
  );
}
