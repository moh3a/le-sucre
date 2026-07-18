"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ScrollText,
  Users,
  Zap,
  CalendarClock,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

type AuditLogRow = {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
};

export function AuditLogsPageClient() {
  const t = useTranslations("audit");
  const [page] = useQueryState("auPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("auPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("auSearch", parseAsString);

  const { data, isLoading } = trpc.adminAuth.listAuditLogs.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
  });

  const { data: stats, isLoading: statsLoading } = trpc.adminAuth.auditStats.useQuery();

  const columns = React.useMemo<ColumnDef<AuditLogRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.created_at, { month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        ),
      },
      {
        id: "actor",
        header: t("user_column"),
        cell: ({ row }) => {
          const { actor_name, actor_email } = row.original;
          if (!actor_name && !actor_email)
            return <span className="text-muted-foreground text-sm">{t("system")}</span>;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{actor_name || t("no_name")}</span>
              <span className="text-muted-foreground text-xs">{actor_email}</span>
            </div>
          );
        },
      },
      {
        id: "action",
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("action_column")} />,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="font-mono text-xs uppercase"
          >
            {row.original.action}
          </Badge>
        ),
      },
      {
        id: "resource",
        header: t("resource_column"),
        cell: ({ row }) => {
          const { resource_type, resource_id } = row.original;
          if (!resource_type) return <span className="text-muted-foreground">{"\u2014"}</span>;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold capitalize">
                {resource_type.replace(/_/g, " ")}
              </span>
              {resource_id && (
                <span className="text-muted-foreground font-mono text-xs">{resource_id}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "ip_address",
        accessorKey: "ip_address",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("ip_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ip_address ?? "\u2014"}</span>
        ),
      },
      {
        id: "metadata",
        accessorKey: "metadata",
        header: t("metadata_column"),
        cell: ({ row }) => {
          const metaStr = row.original.metadata;
          if (!metaStr) return <span className="text-muted-foreground">{"\u2014"}</span>;
          try {
            const parsed = JSON.parse(metaStr);
            return (
              <pre className="bg-muted max-h-16 max-w-xs overflow-auto rounded p-1 font-mono text-[10px]">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            );
          } catch {
            return <span className="font-mono text-[10px]">{metaStr}</span>;
          }
        },
      },
    ],
    [t],
  );

  const items = (data?.items ?? []) as AuditLogRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "auPage", perPage: "auPerPage", sort: "auSort" },
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
        >
          <DataTableSkeleton columnCount={6} rowCount={10} filterCount={1} />
        </ConsolePageShell>
      }
    >
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("stat_total"), value: stats?.total ?? 0, icon: ScrollText, color: "info" },
              { label: t("stat_today"), value: stats?.today ?? 0, icon: CalendarClock, color: "success" },
              { label: t("stat_unique_users"), value: stats?.unique_users ?? 0, icon: Users, color: "default" },
              { label: t("stat_unique_actions"), value: stats?.unique_actions ?? 0, icon: Zap, color: "warning" },
            ]}
          />
        }
      >
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder={t("search_placeholder")}
              value={search || ""}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </ConsolePageShell>
    </QueryGuard>
  );
}
