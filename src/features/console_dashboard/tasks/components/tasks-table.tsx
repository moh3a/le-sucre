"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { CheckCircle2, Download, MoreHorizontal, Play, XCircle } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { STAFF_ROLES } from "@/features/authentication_and_authorization/authorization/constants/roles";
import {
  TASK_TYPES,
  TASK_TYPE_LABEL_KEYS,
  TASK_TYPES_WITH_COMPLETION_EFFECT,
  TASK_COMPLETION_EFFECT_LABEL_KEYS,
  REFERENCE_ROUTES,
  type ReferenceType,
} from "../constants/task-types";

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
  assignee_name: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  completed_at: string | null;
  completed_by_user_id: string | null;
  completion_notes: string | null;
  created_by_user_id: string;
  creator_name: string | null;
  created_at: string;
};

type TasksTableProps = {
  mode?: "mine" | "all";
  showAssigneeFilter?: boolean;
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
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
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

export function TasksTable({ mode = "all", showAssigneeFilter = false }: TasksTableProps) {
  const t = useTranslations("tasks");

  const STATUS_LABELS: Record<string, string> = React.useMemo(
    () => ({
      pending: t("pending_label"),
      in_progress: t("in_progress_label"),
      completed: t("completed_label"),
      cancelled: t("cancelled_label"),
    }),
    [t],
  );

  const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  const TYPE_LABELS: Record<string, string> = React.useMemo(
    () =>
      Object.fromEntries(TASK_TYPES.map((type) => [type, t(TASK_TYPE_LABEL_KEYS[type])])) as Record<
        string,
        string
      >,
    [t],
  );

  const TYPE_OPTIONS = TASK_TYPES.map((type) => ({ value: type, label: TYPE_LABELS[type] }));

  const [page] = useQueryState("tkPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("tkPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("tkStatus", parseAsString);
  const [type, setType] = useQueryState("tkType", parseAsString);
  const [assignee, setAssignee] = useQueryState("tkAssignee", parseAsString);

  const { data: users_data } = trpc.adminAuth.listUsers.useQuery(
    { page: 1, limit: 100 },
    { enabled: showAssigneeFilter },
  );

  const assignee_options = React.useMemo(() => {
    if (!users_data) return [];
    return users_data.items
      .filter((u) =>
        (u.roles ?? "")
          .split(", ")
          .filter(Boolean)
          .some((r) => STAFF_ROLES.includes(r as (typeof STAFF_ROLES)[number])),
      )
      .map((u) => ({ label: u.name, value: u.id }));
  }, [users_data]);

  const utils = trpc.useUtils();

  const invalidate = () => {
    utils.operations.adminTaskListAll.invalidate();
    utils.operations.adminTaskListMine.invalidate();
    utils.operations.adminTaskDashboard.invalidate();
    utils.operations.adminTaskTeamDashboard.invalidate();
  };

  const startMutation = trpc.operations.adminTaskStart.useMutation({
    onSuccess: () => {
      toast.success(t("started"));
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = trpc.operations.adminTaskComplete.useMutation({
    onSuccess: () => {
      toast.success(t("completed_toast"));
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const [complete_target, setCompleteTarget] = React.useState<TaskRow | null>(null);
  const confirmComplete = () => {
    if (complete_target) completeMutation.mutate({ id: complete_target.id });
    setCompleteTarget(null);
  };

  const cancelMutation = trpc.operations.adminTaskCancel.useMutation({
    onSuccess: () => {
      toast.success(t("cancelled_toast"));
      invalidate();
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
          <span className="max-w-60 truncate text-sm font-medium">{row.original.title}</span>
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("priority_column")} />
        ),
        cell: ({ row }) => (
          <Badge
            variant={PRIORITY_STYLES[row.original.priority] ?? "outline"}
            className="text-[10px] uppercase"
          >
            {row.original.priority}
          </Badge>
        ),
      },
      {
        id: "assigned_to_user_id",
        accessorKey: "assigned_to_user_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("assigned_to_column")} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.assignee_name ?? row.original.assigned_to_user_id ?? "—"}
          </span>
        ),
      },
      {
        id: "created_by_user_id",
        accessorKey: "created_by_user_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("created_by_column")} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.creator_name ?? t("system")}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status_column")} />
        ),
        cell: ({ row }) => (
          <Badge variant={STATUS_STYLES[row.original.status] ?? "outline"}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "due_at",
        accessorKey: "due_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("due_date_column")} />
        ),
        cell: ({ row }) =>
          row.original.due_at ? (
            formatDate(row.original.due_at, { month: "short" })
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("created_column")} />
        ),
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const r = row.original;
          const reference_route =
            r.reference_type && REFERENCE_ROUTES[r.reference_type as ReferenceType]
              ? REFERENCE_ROUTES[r.reference_type as ReferenceType] + r.reference_id
              : null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                {reference_route && (
                  <DropdownMenuItem asChild>
                    <Link href={reference_route}>{t("view_reference")}</Link>
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
                  <DropdownMenuItem onClick={() => setCompleteTarget(r)}>
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
    [TYPE_LABELS, STATUS_LABELS, startMutation, cancelMutation, t],
  );

  const mine = mode === "mine";
  const mineQuery = trpc.operations.adminTaskListMine.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    task_type: type || undefined,
  });
  const allQuery = trpc.operations.adminTaskListAll.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    task_type: type || undefined,
    assignee_id: assignee || undefined,
  });
  const { data, isLoading } = mine ? mineQuery : allQuery;

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
        isPending:
          startMutation.isPending || completeMutation.isPending || cancelMutation.isPending,
        error: startMutation.error ?? completeMutation.error ?? cancelMutation.error,
      }}
      loadingFallback={<DataTableSkeleton columnCount={10} rowCount={10} filterCount={1} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <FacetedFilter
            title={t("status_title")}
            options={STATUS_OPTIONS}
            value={status ?? undefined}
            onChange={(val) => setStatus(val)}
          />
          <FacetedFilter
            title={t("type_title")}
            options={TYPE_OPTIONS}
            value={type ?? undefined}
            onChange={(val) => setType(val)}
          />
          {showAssigneeFilter && (
            <FacetedFilter
              title={t("assignee_title")}
              options={assignee_options}
              value={assignee ?? undefined}
              onChange={(val) => setAssignee(val)}
            />
          )}
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
      <AlertDialog open={complete_target !== null} onOpenChange={(open) => !open && setCompleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_complete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {complete_target &&
                (TASK_TYPES_WITH_COMPLETION_EFFECT.has(complete_target.task_type)
                  ? t(
                      TASK_COMPLETION_EFFECT_LABEL_KEYS[complete_target.task_type] ??
                        "confirm_complete_description",
                    )
                  : t("confirm_complete_description"))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel_button")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete}>
              {t("complete_confirm_button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryGuard>
  );
}
