"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { User } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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

type CustomerRow = {
  user_id: string;
  name: string | null;
  email: string;
  image: string | null;
  created_at: string;
  total_orders: number;
  total_spent: string;
  average_order_value: string;
  segment: "vip" | "repeat" | "new";
  last_order_at: string | null;
};

export function CustomersTable() {
  const columns = React.useMemo<ColumnDef<CustomerRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Nom" />,
        cell: ({ row }) => {
          return (
            <Link
              href={`/console/customers/${row.original.user_id}`}
              className="flex items-center gap-3 hover:opacity-75"
            >
              {row.original.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.original.image}
                  alt={row.original.name ?? ""}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                  <User className="text-muted-foreground h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{row.original.name ?? "—"}</span>
                <span className="text-muted-foreground text-xs">{row.original.email}</span>
              </div>
            </Link>
          );
        },
      },
      {
        id: "segment",
        accessorKey: "segment",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Segment" />,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.segment === "vip"
                ? "default"
                : row.original.segment === "repeat"
                  ? "secondary"
                  : "outline"
            }
          >
            {row.original.segment === "vip"
              ? "VIP"
              : row.original.segment === "repeat"
                ? "Répétitif"
                : "Nouveau"}
          </Badge>
        ),
      },
      {
        id: "total_orders",
        accessorKey: "total_orders",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Commandes" />,
      },
      {
        id: "total_spent",
        accessorKey: "total_spent",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Total dépensé" />,
        cell: ({ row }) =>
          Number(row.original.total_spent).toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
      },
      {
        id: "average_order_value",
        accessorKey: "average_order_value",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Panier moyen" />,
        cell: ({ row }) =>
          Number(row.original.average_order_value).toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
      },
      {
        id: "last_order_at",
        accessorKey: "last_order_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Dernière commande" />,
        cell: ({ row }) =>
          row.original.last_order_at
            ? formatDate(row.original.last_order_at, { month: "short" })
            : "—",
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Inscription" />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
    ],
    [],
  );

  const [page] = useQueryState("custPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("custPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("search", parseAsString);

  const { data, isLoading } = trpc.customers.adminList.useQuery({
    page,
    limit: per_page,
  });

  const items = data?.items ?? [];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: page_count,
    queryKeys: { page: "custPage", perPage: "custPerPage", sort: "custSort" },
    getRowId: (row) => row.user_id,
  });

  if (isLoading && !data) return <DataTableSkeleton columnCount={7} rowCount={10} />;

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <Input
          placeholder="Rechercher un client…"
          value={search ?? ""}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  );
}
