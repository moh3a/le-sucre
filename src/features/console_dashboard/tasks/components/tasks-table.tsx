"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import {
  CheckCircle2,
  Download,
  MoreHorizontal,
  Play,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
};

const PRIORITY_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  normal: "secondary",
  high: "default",
  urgent: "destructive",
};

type TaskRow = {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  assigned_to_user_id: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  completed_at: string | null;
  completed_by_user_id: string | null;
  completion_notes: string | null;
  created_by_user_id: string;
  created_at: string;
};

function FacetedFilter({
  title,
  options,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  options: { label: string; value: string }[];
  icon?: React.ComponentType<{ className?: string }>;
  value?: string;
  onChange: (value: string | null) => void;
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
            Icon && <Icon className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {value && (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <span className="ml-1">{options.find((o) => o.value === value)?.label}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <div className="p-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={value === option.value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onChange(value === option.value ? null : option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TasksTable() {
  const t = useTranslations("tasks");

  const STATUS_LABELS: Record<string, string> = {
    pending: t("pending_label"),
    in_progress: t("in_progress_label"),
    completed: t("completed_label"),
    cancelled: t("cancelled_label"),
  };

  const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  const TYPE_LABELS: Record<string, string> = {
    order_follow_up: t("type_order_follow_up"),
    customer_follow_up: t("type_customer_follow_up"),
    inventory_review: t("type_inventory_review"),
    campaign_review: t("type_campaign_review"),
    general: t("type_general"),
  };

  const [page] = useQueryState("tkPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("tkPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("tkStatus", parseAsString);

  const utils = trpc.useUtils();

  const startMutation = trpc.operations.adminTaskStart.useMutation({
    onSuccess: () => {
      toast.success(t("started"));
      utils.operations.adminTaskListAll.invalidate();
      utils.operations.adminTaskDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = trpc.operations.adminTaskComplete.useMutation({
    onSuccess: () => {
      toast.success(t("completed_toast"));
      utils.operations.adminTaskListAll.invalidate();
      utils.operations.adminTaskDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.operations.adminTaskCancel.useMutation({
    onSuccess: () => {
      toast.success(t("cancelled_toast"));
      utils.operations.adminTaskListAll.invalidate();
      utils.operations.adminTaskDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<TaskRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("title_column")} />,
        cell: ({ row }) => (
          <span className="max-w-[240px] truncate font-medium text-sm">{row.original.title}</span>
        ),
      },
      {
        id: "task_type",
        accessorKey: "task_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("type_column")} />,
        cell: ({ row }) => (
          <span className="text-sm">{TYPE_LABELS[row.original.task_type] ?? row.original.task_type}</span>
        ),
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("priority_column")} />,
        cell: ({ row }) => (
          <Badge variant={PRIORITY_STYLES[row.original.priority] ?? "outline"} className="uppercase text-[10px]">
            {row.original.priority}
          </Badge>
        ),
      },
      {
        id: "assigned_to_user_id",
        accessorKey: "assigned_to_user_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("assigned_to_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.assigned_to_user_id
              ? `${row.original.assigned_to_user_id.slice(0, 10)}…`
              : "—"}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_column")} />,
        cell: ({ row }) => (
          <Badge variant={STATUS_STYLES[row.original.status] ?? "outline"}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "due_at",
        accessorKey: "due_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("due_date_column")} />,
        cell: ({ row }) =>
          row.original.due_at ? formatDate(row.original.due_at, { month: "short" }) : <span className="text-muted-foreground">—</span>,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("created_column")} />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                {r.reference_id && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        r.reference_type === "order"
                          ? `/console/orders/${r.reference_id}`
                          : r.reference_type === "campaign"
                            ? `/console/campaigns/${r.reference_id}`
                            : `#`
                      }
                    >
                      {t("view_reference")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {r.status === "pending" && (
                  <DropdownMenuItem onClick={() => startMutation.mutate({ id: r.id })}>
                    <Play className="mr-2 size-4" />
                    {t("start")}
                  </DropdownMenuItem>
                )}
                {r.status === "in_progress" && (
                  <DropdownMenuItem onClick={() => completeMutation.mutate({ id: r.id })}>
                    <CheckCircle2 className="mr-2 size-4 text-green-600" />
                    {t("complete")}
                  </DropdownMenuItem>
                )}
                {(r.status === "pending" || r.status === "in_progress") && (
                  <DropdownMenuItem onClick={() => cancelMutation.mutate({ id: r.id })}>
                    <XCircle className="mr-2 size-4 text-red-600" />
                    {t("cancel_action")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [startMutation, completeMutation, cancelMutation],
  );

  const { data, isLoading } = trpc.operations.adminTaskListAll.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as TaskRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "tkPage", perPage: "tkPerPage", sort: "tkSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      mutation={{
        isPending: startMutation.isPending || completeMutation.isPending || cancelMutation.isPending,
        error: startMutation.error ?? completeMutation.error ?? cancelMutation.error,
      }}
      loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={1} />}
    >
      <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title={t("status_title")}
          options={STATUS_OPTIONS}
          value={status ?? undefined}
          onChange={(val) => setStatus(val)}
        />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2 border-t p-2">
          <Badge variant="outline">
            {t("rows_selected", { count: table.getFilteredSelectedRowModel().rows.length })}
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/api/admin/tasks/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="tasks.csv"
            >
              <Download className="mr-1 h-4 w-4" />
              {t("export")}
            </a>
          </Button>
        </div>
      )}
    </DataTable>
    </QueryGuard>
  );
}
