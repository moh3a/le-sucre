"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { MoreHorizontal, Pencil, Text, ToggleLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";

type ProductRow = {
  id: string;
  name: string | null;
  sku: string;
  slug: string;
  status: "draft" | "published" | "archived";
  base_price: string;
  offer_price: string | null;
  created_at: string;
};

export function ProductDataTable() {
  const t = useTranslations("products");

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("name")} />,
        cell: ({ row }) => <span className="font-medium">{row.original.name ?? "—"}</span>,
        meta: { label: t("name"), placeholder: "Rechercher…", variant: "text", icon: Text },
        enableColumnFilter: true,
      },
      {
        id: "sku",
        accessorKey: "sku",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("sku")} />,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status")} />,
        cell: ({ row }) => <Badge variant="secondary">{t(`status_${row.original.status}`)}</Badge>,
        meta: {
          label: t("status"),
          variant: "select",
          icon: ToggleLeft,
          options: [
            { label: t("status_draft"), value: "draft" },
            { label: t("status_published"), value: "published" },
            { label: t("status_archived"), value: "archived" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "base_price",
        accessorKey: "base_price",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("base_price")} />,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Créé le" />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/console/products/${row.original.id}/edit`}>
                  <Pencil />
                  {t("edit")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t],
  );

  const [page] = useQueryState("prodPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("prodPerPage", parseAsInteger.withDefault(10));
  const [search] = useQueryState("name", parseAsString);
  const [status_filter] = useQueryState("status", parseAsArrayOf(parseAsString, ","));

  const status = status_filter?.[0] as ProductRow["status"] | undefined;

  const { data, isLoading } = trpc.products.list.useQuery({
    page,
    limit: per_page,
    search: search?.trim() || undefined,
    status,
  });

  const items = (data?.items ?? []) as ProductRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: page_count,
    queryKeys: { page: "prodPage", perPage: "prodPerPage", sort: "prodSort" },
    getRowId: (row) => row.id,
  });

  if (isLoading && !data)
    return <DataTableSkeleton columnCount={6} rowCount={10} filterCount={2} />;

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <DataTableSortList table={table} />
      </DataTableToolbar>
    </DataTable>
  );
}
