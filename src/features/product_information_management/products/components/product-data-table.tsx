"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { MoreHorizontal, Pencil, Text, ToggleLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useTranslations } from "next-intl";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableToolbar } from "@/features/data-table/components/data-table-toolbar";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";

// TODO
// Add filters: brand (from trpc.products.brandsActive), category select, stock_status, price range
// Add bulk toolbar with trpc.products.bulkAction.useMutation

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  status: "draft" | "published" | "archived" | undefined;
  base_price: string;
  created_at: string;
  name: string | null;
  category_name: string | null;
  brand_name: string | null;
  image_url: string | null;
  sku_count: number;
  current_stock: number;
  units_sold: number;
  revenue: string;
  review_count: number;
  average_rating: string;
};

export function ProductDataTable() {
  const t = useTranslations("products");

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "Image",
        accessorKey: "image_url",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Image" />,
        cell: ({ row }) =>
          row.original.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.image_url}
              alt={row.original.name ?? ""}
              className="h-20 w-20 object-cover object-center"
            />
          ) : (
            <div className="h-20 w-20 bg-neutral-500"></div>
          ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("name")} />,
        cell: ({ row }) => <span className="font-medium">{row.original.name ?? "—"}</span>,
        meta: { label: t("name"), placeholder: "Rechercher…", variant: "text", icon: Text },
        enableColumnFilter: true,
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
        id: "Category",
        accessorKey: "category_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Category" />,
      },
      {
        id: "Brand",
        accessorKey: "brand_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Brand" />,
      },
      {
        id: "stock",
        accessorKey: "current_stock",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Stock" />,
      },
      {
        id: "Units sold",
        accessorKey: "units_sold",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Sales" />,
      },
      {
        id: "Revenue",
        accessorKey: "revenue",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Revenue" />,
      },
      {
        id: "Rating",
        accessorKey: "average_rating",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Rating" />,
        cell: ({ row }) => (
          <div>
            {row.original.average_rating}{" "}
            <Badge variant="secondary">{row.original.review_count}</Badge>
          </div>
        ),
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

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.products.adminList.useQuery({
    page,
    limit: per_page,
    search: search?.trim() || undefined,
    status,
  });

  const bulk = trpc.products.bulkAction.useMutation({
    onSuccess: () => utils.products.adminList.invalidate(),
  });
  function run_bulk(action: "activate" | "deactivate" | "delete") {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (!ids.length) return;
    bulk.mutate({ product_ids: ids, action });
  }

  const items = data?.items ?? [];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: page_count,
    queryKeys: { page: "prodPage", perPage: "prodPerPage", sort: "prodSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
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
