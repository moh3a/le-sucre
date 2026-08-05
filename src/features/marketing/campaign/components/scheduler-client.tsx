"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Ban,
  Clock,
  CheckCircle2,
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
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
import { formatDate } from "@/lib/format";
import { trpc } from "@/components/providers/app-providers";

type SchedulerJobRow = {
  id: string;
  job_type: string;
  campaign_id: string | null;
  campaign_name: string | null;
  status: string;
  run_after: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
};

const JOB_STATUS_VALUES = ["pending", "processing", "done", "failed"] as const;

type JobStatusValue = (typeof JOB_STATUS_VALUES)[number];

function JobStatusBadge({ status }: { status: string }) {
  const t = useTranslations("campaigns");
  const config: Record<string, { labelKey: string; className: string }> = {
    pending: {
      labelKey: "job_status_pending",
      className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    processing: {
      labelKey: "job_status_processing",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    done: {
      labelKey: "job_status_done",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    failed: {
      labelKey: "job_status_failed",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  const c = config[status] ?? { labelKey: "", className: "" };
  return (
    <Badge className={`border-0 text-xs font-medium ${c.className}`}>
      {c.labelKey ? t(c.labelKey) : status}
    </Badge>
  );
}

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
          {JOB_STATUS_VALUES.map((option) => (
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

export function SchedulerClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");

  const [page, setPage] = useQueryState("schPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("schPerPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("schSearch", parseAsString);
  const [status, setStatus] = useQueryState("schStatus", parseAsString);

  const { data, isLoading } = trpc.campaigns.schedulerJobs.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
    status: (status || undefined) as JobStatusValue | undefined,
  });

  const { data: stats, isLoading: statsLoading } = trpc.campaigns.schedulerStats.useQuery();
  const utils = trpc.useUtils();

  const cancelMutation = trpc.campaigns.schedulerJobCancel.useMutation({
    onSuccess: () => {
      utils.campaigns.schedulerJobs.invalidate();
      utils.campaigns.schedulerStats.invalidate();
      toast.success(t("job_cancelled"));
    },
    onError: (err) => {
      toast.error(err.message || t("job_cancel_error"));
    },
  });

  const columns = React.useMemo<ColumnDef<SchedulerJobRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "job_type",
        accessorKey: "job_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("job_type_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{t(`job_type_${row.original.job_type}` as never)}</span>
            <span className="text-muted-foreground font-mono text-xs">{row.original.job_type}</span>
          </div>
        ),
      },
      {
        id: "campaign",
        accessorKey: "campaign_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("job_campaign_column")} />
        ),
        cell: ({ row }) =>
          row.original.campaign_id ? (
            <Link
              href={`/console/campaigns/${row.original.campaign_id}`}
              className="font-medium hover:underline"
            >
              {row.original.campaign_name ?? row.original.campaign_id}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("job_status_column")} />
        ),
        cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
      },
      {
        id: "run_after",
        accessorKey: "run_after",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("job_run_after_column")} />
        ),
        cell: ({ row }) =>
          formatDate(row.original.run_after, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        id: "attempts",
        accessorKey: "attempts",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("job_attempts_column")} />
        ),
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.attempts}</span>,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("job_created_column")} />
        ),
        cell: ({ row }) =>
          formatDate(row.original.created_at, { day: "numeric", month: "short", year: "numeric" }),
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
              {row.original.campaign_id && (
                <DropdownMenuItem asChild>
                  <Link href={`/console/campaigns/${row.original.campaign_id}`}>
                    <Pencil className="mr-2 size-4" />
                    {tc("edit")}
                  </Link>
                </DropdownMenuItem>
              )}
              {row.original.status === "pending" && (
                <DropdownMenuItem
                  onClick={() => cancelMutation.mutate({ id: row.original.id })}
                >
                  <Ban className="mr-2 size-4 text-red-600" />
                  {t("job_cancel")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tc, cancelMutation],
  );

  const items = (data?.items ?? []) as SchedulerJobRow[];
  const page_count = data?.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "schPage", perPage: "schPerPage", sort: "schSort" },
    getRowId: (row) => row.id,
  });

  function bulkCancel() {
    const ids = table
      .getFilteredSelectedRowModel()
      .rows.filter((r) => r.original.status === "pending")
      .map((r) => r.original.id);
    ids.forEach((id) => cancelMutation.mutate({ id }));
  }

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />}
    >
      <ConsolePageShell
        title={t("scheduler_title")}
        subtitle={t("scheduler_subtitle")}
        actions={
          <Button asChild>
            <Link href="/console/campaigns/new">
              <Plus className="mr-2 size-4" />
              {t("scheduler_create")}
            </Link>
          </Button>
        }
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("scheduler_total"), value: stats?.total ?? 0, icon: Layers, color: "info" },
              {
                label: t("scheduler_pending"),
                value: stats?.pending ?? 0,
                icon: Clock,
                color: "warning",
              },
              {
                label: t("scheduler_processing"),
                value: stats?.processing ?? 0,
                icon: Loader2,
                color: "info",
              },
              {
                label: t("scheduler_done"),
                value: stats?.done ?? 0,
                icon: CheckCircle2,
                color: "success",
              },
              {
                label: t("scheduler_failed"),
                value: stats?.failed ?? 0,
                icon: Ban,
                color: "error",
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
              title={t("job_status_column")}
              value={status ?? undefined}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              labels={(value) => t(`job_status_${value}` as never)}
            />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-2 border-t p-2">
              <Badge variant="outline">
                {table.getFilteredSelectedRowModel().rows.length} {t("selected")}
              </Badge>
              <Button variant="destructive" size="sm" onClick={bulkCancel}>
                <Ban className="mr-1 size-4" />
                {t("job_cancel")}
              </Button>
            </div>
          )}
        </DataTable>
        <p className="text-muted-foreground max-w-3xl text-sm">{t("scheduler_note")}</p>
      </ConsolePageShell>
    </QueryGuard>
  );
}
