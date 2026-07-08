"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Calendar, Hash, MoreHorizontal, Pencil, Text, ToggleLeft, Trash2 } from "lucide-react";
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
import { CategoryFormDialog } from "@/features/product_information_management/categories/components/category-form-dialog";
import type { CategoryRecord } from "@/features/product_information_management/categories/types";
import { useDataTable } from "@/features/data-table/use-data-table";
import { formatDate } from "@/lib/format";

function CategoryRowActions({
  category,
  on_edit,
}: {
  category: CategoryRecord;
  on_edit: (id: string) => void;
}) {
  const t = useTranslations("categories");
  const utils = trpc.useUtils();

  const delete_mutation = trpc.categories.delete.useMutation({
    onSuccess: async () => {
      await utils.categories.list.invalidate();
      await utils.categories.tree.invalidate();
    },
  });

  async function on_delete() {
    if (!window.confirm(t("delete_confirm", { name: category.name }))) return;
    await delete_mutation.mutateAsync({ id: category.id });
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
        <DropdownMenuItem onClick={() => on_edit(category.id)}>
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

export function CategoryTable() {
  const t = useTranslations("categories");
  const [edit_id, set_edit_id] = React.useState<string | null>(null);

  const { data: tree } = trpc.categories.tree.useQuery();

  const parent_name_by_id = React.useMemo(() => {
    const map = new Map<string, string>();
    if (!tree) return map;

    function walk(nodes: typeof tree) {
      for (const node of nodes ?? []) {
        map.set(node.id, node.name);
        if (node.children?.length) walk(node.children);
      }
    }

    walk(tree);
    return map;
  }, [tree]);

  const columns = React.useMemo<ColumnDef<CategoryRecord>[]>(
    () => [
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
        id: "parent",
        accessorFn: (row) => (row.parent_id ? (parent_name_by_id.get(row.parent_id) ?? "—") : "—"),
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("parent")} />,
        cell: ({ row }) => row.getValue("parent"),
        enableSorting: false,
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
        id: "depth",
        accessorKey: "depth",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("depth")} />,
        cell: ({ row }) => row.getValue("depth"),
        meta: { label: t("depth"), icon: Hash },
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "sort_order",
        accessorKey: "sort_order",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("sort_order")} />,
        cell: ({ row }) => row.getValue("sort_order"),
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
        id: "updated_at",
        accessorKey: "updated_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("updated_at")} />,
        cell: ({ row }) =>
          formatDate(row.getValue("updated_at"), {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "actions",
        cell: ({ row }) => <CategoryRowActions category={row.original} on_edit={set_edit_id} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [parent_name_by_id, t],
  );

  const [page] = useQueryState("catPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("catPerPage", parseAsInteger.withDefault(10));
  const [name_filter] = useQueryState("name", parseAsString);
  const [active_filter] = useQueryState("is_active", parseAsArrayOf(parseAsString, ","));

  const search = name_filter?.trim() || undefined;
  const active_value = active_filter?.[0];
  const is_active = active_value === "true" ? true : active_value === "false" ? false : undefined;

  const query = trpc.categories.list.useQuery({
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
      page: "catPage",
      perPage: "catPerPage",
      sort: "catSort",
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnVisibility: {
        description: false,
        depth: false,
        updated_at: false,
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

        <CategoryFormDialog
          mode="edit"
          category_id={edit_id ?? undefined}
          open={!!edit_id}
          onOpenChange={(open) => {
            if (!open) set_edit_id(null);
          }}
        />
      </>
    </QueryGuard>
  );
}
