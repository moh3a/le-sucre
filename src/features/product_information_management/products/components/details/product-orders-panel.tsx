"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { trpc } from "@/components/providers/app-providers";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

type ProductOrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  grand_total: string;
  customer_name: string | null;
  created_at: string;
};

const columns: ColumnDef<ProductOrderRow>[] = [
  {
    id: "order_number",
    accessorKey: "order_number",
    header: ({ column }) => <DataTableColumnHeader column={column} label="N° commande" />,
    cell: ({ row }) => (
      <Link
        href={`/console/orders/${row.original.id}`}
        className="font-mono text-sm font-medium hover:underline"
      >
        {row.original.order_number}
      </Link>
    ),
  },
  {
    id: "customer",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Client" />,
    cell: ({ row }) => row.original.customer_name ?? "—",
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    id: "grand_total",
    accessorKey: "grand_total",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Total" />,
    cell: ({ row }) =>
      Number(row.original.grand_total).toLocaleString("fr-FR", {
        style: "currency",
        currency: "DZD",
        maximumFractionDigits: 0,
      }),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
    cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
  },
];

export function ProductOrdersPanel({ product_id }: { product_id: string }) {
  const { data, isLoading } = trpc.orders.adminListByProduct.useQuery({
    product_id,
    page: 1,
    limit: 10,
  });

  const items = (data ?? []) as ProductOrderRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 1,
    queryKeys: { page: "poPage", perPage: "poPerPage" },
    getRowId: (row) => row.id,
  });

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={5} />;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {data?.meta.total_records ?? 0} commande(s) contenant ce produit
      </p>
      <DataTable table={table} />
    </div>
  );
}
