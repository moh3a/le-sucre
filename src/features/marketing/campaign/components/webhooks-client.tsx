"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  CheckCircle2,
  Clock,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  Radio,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

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

type WebhookEventRow = {
  id: string;
  event_type: string;
  campaign_id: string;
  campaign_name: string | null;
  campaign_type: string | null;
  status: string;
  created_at: string;
};

const WEBHOOK_STATUS_VALUES = ["pending", "done", "failed"] as const;

type WebhookStatusValue = (typeof WEBHOOK_STATUS_VALUES)[number];

function eventLabelKey(event_type: string) {
  return `event_${event_type.replace(/\./g, "_")}`;
}

function WebhookStatusBadge({ status }: { status: string }) {
  const t = useTranslations("campaigns");
  const config: Record<string, { labelKey: string; className: string }> = {
    pending: {
      labelKey: "webhook_status_pending",
      className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    done: {
      labelKey: "webhook_status_done",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    failed: {
      labelKey: "webhook_status_failed",
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
          {WEBHOOK_STATUS_VALUES.map((option) => (
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

export function WebhooksClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");

  const [page, setPage] = useQueryState("whPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("whPerPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("whSearch", parseAsString);
  const [status, setStatus] = useQueryState("whStatus", parseAsString);

  const { data, isLoading } = trpc.campaigns.webhookEventsAdmin.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
    status: (status || undefined) as WebhookStatusValue | undefined,
  });

  const { data: stats, isLoading: statsLoading } = trpc.campaigns.webhookStats.useQuery();

  const columns = React.useMemo<ColumnDef<WebhookEventRow>[]>(
    () => [
      {
        id: "event",
        accessorKey: "event_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("event_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{t(eventLabelKey(row.original.event_type) as never)}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {row.original.event_type}
            </span>
          </div>
        ),
      },
      {
        id: "campaign",
        accessorKey: "campaign_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("campaign_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`/console/campaigns/${row.original.campaign_id}`}
              className="font-medium hover:underline"
            >
              {row.original.campaign_name ?? row.original.campaign_id}
            </Link>
            <span className="text-muted-foreground font-mono text-xs">
              {row.original.campaign_id.slice(0, 12)}
            </span>
          </div>
        ),
      },
      {
        id: "campaign_type",
        accessorKey: "campaign_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("type_column")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.campaign_type ?? "—"}</span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("webhook_delivery_status")} />
        ),
        cell: ({ row }) => <WebhookStatusBadge status={row.original.status} />,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("timestamp_column")} />
        ),
        cell: ({ row }) =>
          formatDate(row.original.created_at, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
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
                <Link href={`/console/campaigns/${row.original.campaign_id}`}>
                  <Pencil className="mr-2 size-4" />
                  {tc("edit")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tc],
  );

  const items = (data?.items ?? []) as WebhookEventRow[];
  const page_count = data?.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "whPage", perPage: "whPerPage", sort: "whSort" },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={6} rowCount={10} filterCount={2} />}
    >
      <ConsolePageShell
        title={t("webhook_events")}
        subtitle={t("webhook_events_subtitle")}
        actions={
          <Button asChild>
            <Link href="/console/campaigns/new">
              <Plus className="mr-2 size-4" />
              {t("webhook_create")}
            </Link>
          </Button>
        }
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("webhook_total"), value: stats?.total ?? 0, icon: Radio, color: "info" },
              {
                label: t("webhook_pending"),
                value: stats?.pending ?? 0,
                icon: Clock,
                color: "warning",
              },
              {
                label: t("webhook_done"),
                value: stats?.done ?? 0,
                icon: CheckCircle2,
                color: "success",
              },
              {
                label: t("webhook_failed"),
                value: stats?.failed ?? 0,
                icon: XCircle,
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
              title={t("webhook_delivery_status")}
              value={status ?? undefined}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              labels={(value) => t(`webhook_status_${value}` as never)}
            />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
        <p className="text-muted-foreground max-w-3xl text-sm">{t("webhook_note")}</p>
      </ConsolePageShell>
    </QueryGuard>
  );
}
