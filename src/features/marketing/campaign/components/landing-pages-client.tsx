"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  BarChart3,
  FileText,
  Flame,
  Layers,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Square,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { CampaignStatusBadge } from "./campaign_status_badge";
import { formatDate } from "@/lib/format";
import { trpc } from "@/components/providers/app-providers";

type LandingPageRow = {
  id: string;
  name: string;
  slug: string;
  campaign_type: string;
  status: string;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const CAMPAIGN_STATUS_VALUES = [
  "draft",
  "scheduled",
  "active",
  "paused",
  "ended",
  "cancelled",
] as const;

type CampaignStatusValue = (typeof CAMPAIGN_STATUS_VALUES)[number];

function FacetedFilter({
  title,
  value,
  onChange,
  labels,
}: {
  title: string;
  value?: string;
  onChange: (value: string | null) => void;
  labels: (value: string) => string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {value ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            <Layers className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {value && (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <span className="ml-1">{labels(value)}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <div className="p-2">
          {CAMPAIGN_STATUS_VALUES.map((option) => (
            <Button
              key={option}
              variant={value === option ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onChange(value === option ? null : option);
                setOpen(false);
              }}
            >
              {labels(option)}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function LandingPagesClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");

  const [page, setPage] = useQueryState("lpPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("lpPerPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("lpSearch", parseAsString);
  const [status, setStatus] = useQueryState("lpStatus", parseAsString);

  const { data, isLoading } = trpc.campaigns.adminList.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
    status: (status || undefined) as CampaignStatusValue | undefined,
    campaign_type: "landing_page",
  });

  const { data: stats, isLoading: statsLoading } =
    trpc.campaigns.landingPageStats.useQuery();
  const utils = trpc.useUtils();

  const setStatusMutation = trpc.campaigns.setStatus.useMutation({
    onSuccess: () => {
      utils.campaigns.adminList.invalidate();
      utils.campaigns.landingPageStats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || t("landing_pages_update_error"));
    },
  });

  const columns = React.useMemo<ColumnDef<LandingPageRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("campaign_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`/console/campaigns/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.name}
            </Link>
            <span className="text-muted-foreground font-mono text-xs">{row.original.slug}</span>
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status_column")} />
        ),
        cell: ({ row }) => <CampaignStatusBadge status={row.original.status} />,
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("priority_column")} />
        ),
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.priority}</span>,
      },
      {
        id: "starts_at",
        accessorKey: "starts_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("start_column")} />
        ),
        cell: ({ row }) =>
          row.original.starts_at
            ? formatDate(row.original.starts_at, { day: "numeric", month: "short", year: "numeric" })
            : "—",
      },
      {
        id: "ends_at",
        accessorKey: "ends_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("end_column")} />
        ),
        cell: ({ row }) =>
          row.original.ends_at
            ? formatDate(row.original.ends_at, { day: "numeric", month: "short", year: "numeric" })
            : "—",
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
                <Link href={`/console/campaigns/${row.original.id}?tab=analytics`}>
                  <BarChart3 className="mr-2 size-4" />
                  {t("landing_pages_analytics")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/console/campaigns/${row.original.id}`}>
                  <Pencil className="mr-2 size-4" />
                  {tc("edit")}
                </Link>
              </DropdownMenuItem>
              {row.original.status !== "active" && (
                <DropdownMenuItem
                  onClick={() => setStatusMutation.mutate({ id: row.original.id, status: "active" })}
                >
                  <Play className="mr-2 size-4 text-emerald-600" />
                  {t("activate")}
                </DropdownMenuItem>
              )}
              {row.original.status === "active" && (
                <DropdownMenuItem
                  onClick={() => setStatusMutation.mutate({ id: row.original.id, status: "paused" })}
                >
                  <Square className="mr-2 size-4 text-amber-600" />
                  {t("pause")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tc, setStatusMutation],
  );

  const items = (data?.items ?? []) as LandingPageRow[];
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "lpPage", perPage: "lpPerPage", sort: "lpSort" },
    getRowId: (row) => row.id,
  });

  function bulkSetStatus(next_status: "active" | "paused") {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    ids.forEach((id) => setStatusMutation.mutate({ id, status: next_status }));
  }

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={6} rowCount={10} filterCount={2} />}
    >
      <ConsolePageShell
        title={t("landing_pages")}
        subtitle={t("landing_pages_subtitle")}
        actions={
          <Button asChild>
            <Link href="/console/campaigns/new">
              <Plus className="mr-2 size-4" />
              {t("landing_pages_create")}
            </Link>
          </Button>
        }
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("landing_pages_total"), value: stats?.total ?? 0, icon: Layers, color: "info" },
              {
                label: t("landing_pages_active"),
                value: stats?.active ?? 0,
                icon: Flame,
                color: "success",
              },
              {
                label: t("landing_pages_draft"),
                value: stats?.draft ?? 0,
                icon: FileText,
                color: "warning",
              },
              {
                label: t("landing_pages_ended"),
                value: stats?.ended ?? 0,
                icon: Square,
                color: "default",
              },
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
                setPage(1);
              }}
              className="max-w-sm"
            />
            <FacetedFilter
              title={t("status_title")}
              value={status ?? undefined}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              labels={(value) => t(`status_${value}` as never)}
            />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-2 border-t p-2">
              <Badge variant="outline">
                {table.getFilteredSelectedRowModel().rows.length} {t("selected")}
              </Badge>
              <Button variant="secondary" size="sm" onClick={() => bulkSetStatus("active")}>
                <Play className="mr-1 size-4" />
                {t("activate")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => bulkSetStatus("paused")}>
                <Pause className="mr-1 size-4" />
                {t("pause")}
              </Button>
            </div>
          )}
        </DataTable>
      </ConsolePageShell>
    </QueryGuard>
  );
}
