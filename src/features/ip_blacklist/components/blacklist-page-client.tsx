"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ShieldBan,
  Plus,
  Power,
  PowerOff,
  Trash2,
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { getQueryKey } from "@trpc/react-query";
import { useOptimisticToggle } from "@/hooks/use-optimistic-mutation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { BlacklistAddDialog } from "./blacklist-add-dialog";
import { BlacklistEditDialog } from "./blacklist-edit-dialog";

type BlacklistRow = {
  id: string;
  ip_address: string;
  reason: string | null;
  reason_fr: string | null;
  reason_ar: string | null;
  is_active: boolean;
  expires_at: Date | string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function BlacklistPageClient() {
  const t = useTranslations("blacklist");
  const [page] = useQueryState("blPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("blPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("blSearch", parseAsString);

  const [create_open, setCreateOpen] = React.useState(false);
  const [edit_entry, setEditEntry] = React.useState<BlacklistRow | null>(null);
  const [delete_entry, setDeleteEntry] = React.useState<BlacklistRow | null>(null);

  const { data, isLoading } = trpc.blacklist.list.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
  });

  const { data: stats, isLoading: statsLoading } = trpc.blacklist.stats.useQuery();

  const utils = trpc.useUtils();
  const { toggle: optimisticToggle } = useOptimisticToggle();

  const toggle = trpc.blacklist.toggle.useMutation({
    onSuccess: () => {
      utils.blacklist.list.invalidate();
      utils.blacklist.stats.invalidate();
      toast.success(t("status_updated"));
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.blacklist.remove.useMutation({
    onSuccess: () => {
      utils.blacklist.list.invalidate();
      utils.blacklist.stats.invalidate();
      toast.success(t("entry_deleted"));
      setDeleteEntry(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<BlacklistRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "ip_address",
        accessorKey: "ip_address",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("ip_address")} />,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">{row.original.ip_address}</span>
        ),
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("reason")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1 max-w-xs text-sm">
            {row.original.reason_fr ?? row.original.reason ?? "\u2014"}
          </span>
        ),
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status")} />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? t("active") : t("inactive")}
          </Badge>
        ),
      },
      {
        id: "expires_at",
        accessorKey: "expires_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("expires_at")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.expires_at
              ? formatDate(row.original.expires_at, { month: "short" })
              : "\u2014"}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("created_at")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.created_at, { month: "short" })}
          </span>
        ),
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
              <DropdownMenuItem onClick={() => setEditEntry(row.original)}>
                <Pencil className="mr-2 size-4" />
                {t("edit_button")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  optimisticToggle({
                    query_key: getQueryKey(trpc.blacklist.list, { page, limit: per_page, search: search || undefined }, "query"),
                    updater: (old: { entries: BlacklistRow[] } | undefined) => old ? { ...old, entries: old.entries.map((e) => e.id === row.original.id ? { ...e, is_active: !e.is_active } : e) } : { entries: [] as BlacklistRow[] },
                    mutate: () => toggle.mutateAsync({ id: row.original.id }),
                    success_key: "toggle_updated",
                    error_key: "action_failed",
                  })
                }
              >
                {row.original.is_active ? (
                  <>
                    <PowerOff className="mr-2 size-4 text-amber-500" />
                    {t("deactivate")}
                  </>
                ) : (
                  <>
                    <Power className="mr-2 size-4 text-emerald-500" />
                    {t("activate")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteEntry(row.original)}
              >
                <Trash2 className="mr-2 size-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [optimisticToggle, toggle, t],
  );

  const items = (data?.entries ?? []) as BlacklistRow[];
  const page_count = data?.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "blPage", perPage: "blPerPage", sort: "blSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={
        <ConsolePageShell
          title={t("title")}
          subtitle={t("subtitle")}
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("block_ip_button")}
            </Button>
          }
        >
          <DataTableSkeleton columnCount={6} rowCount={10} filterCount={1} />
        </ConsolePageShell>
      }
    >
      <>
        <ConsolePageShell
          title={t("title")}
          subtitle={t("subtitle")}
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("block_ip_button")}
            </Button>
          }
          stats={
            <StatsGrid
              loading={statsLoading}
              items={[
                { label: t("stat_total"), value: stats?.total ?? 0, icon: ShieldBan, color: "info" },
                { label: t("stat_active"), value: stats?.active ?? 0, icon: CheckCircle2, color: "success" },
                { label: t("stat_inactive"), value: stats?.inactive ?? 0, icon: XCircle, color: "default" },
                { label: t("stat_expiring_soon"), value: stats?.expiring_soon ?? 0, icon: Clock, color: "warning" },
              ]}
            />
          }
        >
          <DataTable table={table}>
            <DataTableAdvancedToolbar table={table}>
              <Input
                placeholder={t("search_placeholder")}
                value={search || ""}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="max-w-sm"
              />
              <DataTableSortList table={table} />
            </DataTableAdvancedToolbar>
          </DataTable>
        </ConsolePageShell>

        <BlacklistAddDialog
          open={create_open}
          on_open_change={setCreateOpen}
        />

        <BlacklistEditDialog
          open={!!edit_entry}
          on_open_change={(v) => {
            if (!v) setEditEntry(null);
          }}
          entry={edit_entry}
        />

        <Dialog open={!!delete_entry} onOpenChange={(v) => { if (!v) setDeleteEntry(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("confirm_delete_title")}</DialogTitle>
              <DialogDescription>
                {t("confirm_delete_description", { ip: delete_entry?.ip_address ?? "" })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteEntry(null)}>
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => delete_entry && remove.mutate({ id: delete_entry.id })}
                disabled={remove.isPending}
              >
                {remove.isPending ? t("deleting") : t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </QueryGuard>
  );
}
