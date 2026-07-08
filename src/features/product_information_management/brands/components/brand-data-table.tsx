/* eslint-disable jsx-a11y/alt-text */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Calendar,
  Globe,
  Image,
  MoreHorizontal,
  Pencil,
  Text,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableToolbar } from "@/features/data-table/components/data-table-toolbar";
import { QueryGuard } from "@/components/query-guard";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandFormDialog } from "./brand-form-dialog";
import type { BrandRecord } from "../types";
import { useDataTable } from "@/features/data-table/use-data-table";
import { formatDate } from "@/lib/format";

function BrandRowActions({
  brand,
  on_edit,
}: {
  brand: BrandRecord;
  on_edit: (id: string) => void;
}) {
  const t = useTranslations("brands");
  const utils = trpc.useUtils();

  const delete_mutation = trpc.brands.delete.useMutation({
    onSuccess: async () => {
      await utils.brands.list.invalidate();
      await utils.brands.active.invalidate();
      await utils.brands.stats.invalidate();
    },
  });

  async function on_delete() {
    if (!window.confirm(t("delete_confirm", { name: brand.name }))) return;
    await delete_mutation.mutateAsync({ id: brand.id });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">{t("actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => on_edit(brand.id)}>
          <Pencil />
          {t("edit")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={delete_mutation.isPending}
          onClick={() => void on_delete()}
        >
          <Trash2 />
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BrandDataTable() {
  const t = useTranslations("brands");
  const [edit_id, set_edit_id] = React.useState<string | null>(null);

  const columns = React.useMemo<ColumnDef<BrandRecord>[]>(
    () => [
      {
        id: "logo_url",
        accessorKey: "logo_url",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("logo")} />,
        cell: ({ row }) => {
          const url = row.getValue("logo_url") as string | null;
          return url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-200 text-neutral-400">
              <Image className="size-5" />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("name")} />,
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
        meta: {
          label: t("name"),
          placeholder: t("search_name"),
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: "slug",
        accessorKey: "slug",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("slug")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs">{row.getValue("slug")}</span>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("description")} />,
        cell: ({ row }) => {
          const value = row.getValue("description") as string | null;
          if (!value) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="text-muted-foreground line-clamp-1 max-w-[200px] text-sm">
              {value}
            </span>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "website_url",
        accessorKey: "website_url",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("website")} />,
        cell: ({ row }) => {
          const url = row.getValue("website_url") as string | null;
          if (!url) return <span className="text-muted-foreground">—</span>;
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-1 text-sm hover:underline"
            >
              <Globe className="size-3" />
              {new URL(url).hostname}
            </a>
          );
        },
        meta: { label: t("website"), icon: Globe },
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("active")} />,
        cell: ({ row }) => {
          const active = row.getValue("is_active") as boolean;
          return (
            <Badge variant={active ? "default" : "secondary"}>
              {active ? t("status_active") : t("status_inactive")}
            </Badge>
          );
        },
        meta: {
          label: t("active"),
          variant: "select",
          icon: ToggleLeft,
          options: [
            { label: t("status_active"), value: "true" },
            { label: t("status_inactive"), value: "false" },
          ],
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("created_at")} />,
        cell: ({ row }) =>
          formatDate(row.getValue("created_at"), {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        meta: { label: t("created_at"), icon: Calendar },
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "actions",
        cell: ({ row }) => <BrandRowActions brand={row.original} on_edit={set_edit_id} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t],
  );

  const [page] = useQueryState("brandPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("brandPerPage", parseAsInteger.withDefault(10));
  const [name_filter] = useQueryState("name", parseAsString);
  const [active_filter] = useQueryState("is_active", parseAsArrayOf(parseAsString, ","));

  const search = name_filter?.trim() || undefined;
  const active_value = active_filter?.[0];
  const is_active = active_value === "true" ? true : active_value === "false" ? false : undefined;

  const query = trpc.brands.list.useQuery({
    page,
    limit: per_page,
    search,
    is_active,
  });
  const { data, isLoading, isFetching } = query;

  const items = data?.items ?? [];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: page_count,
    queryKeys: {
      page: "brandPage",
      perPage: "brandPerPage",
      sort: "brandSort",
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnVisibility: {
        description: false,
        slug: false,
        website_url: false,
      },
    },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={query}
      loadingFallback={
        <DataTableSkeleton columnCount={columns.length} rowCount={10} filterCount={2} />
      }
    >
      <>
        <DataTable table={table}>
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableToolbar>
        </DataTable>

        {isFetching && !isLoading ? (
          <p className="text-muted-foreground text-xs">{t("refreshing")}</p>
        ) : null}

        <BrandFormDialog
          mode="edit"
          brand_id={edit_id ?? undefined}
          open={!!edit_id}
          onOpenChange={(open) => {
            if (!open) set_edit_id(null);
          }}
        />
      </>
    </QueryGuard>
  );
}
