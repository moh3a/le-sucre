"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import {
  CheckCircle2,
  Download,
  MoreHorizontal,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
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



type SupportCaseRow = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to_user_id: string | null;
  resolution: string | null;
  resolved_by_user_id: string | null;
  resolved_at: string | null;
  reopened_count: number;
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

export function SupportCasesTable() {
  const t = useTranslations("support");
  const [page] = useQueryState("scPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("scPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("scStatus", parseAsString);

  const STATUS_LABELS: Record<string, string> = {
    open: t("open"),
    assigned: t("assigned"),
    in_progress: t("in_progress"),
    resolved: t("resolved"),
    closed: t("closed"),
    reopened: t("reopened"),
  };
  const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }));

  const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    open: "destructive",
    assigned: "secondary",
    in_progress: "secondary",
    resolved: "default",
    closed: "outline",
    reopened: "destructive",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    low: t("priority_low"),
    normal: t("priority_normal"),
    high: t("priority_high"),
    urgent: t("priority_urgent"),
  };

  const CATEGORY_LABELS: Record<string, string> = {
    general: t("general"),
    shipping: t("shipping"),
    payment: t("payment"),
    product: t("product"),
    return: t("return"),
    complaint: t("complaint"),
  };

  const utils = trpc.useUtils();

  const resolveMutation = trpc.operations.customerResolveCase.useMutation({
    onSuccess: () => {
      toast.success(t("case_resolved"));
      utils.operations.customerListCases.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const closeMutation = trpc.operations.customerCloseCase.useMutation({
    onSuccess: () => {
      toast.success(t("case_closed"));
      utils.operations.customerListCases.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const reopenMutation = trpc.operations.customerReopenCase.useMutation({
    onSuccess: () => {
      toast.success(t("case_reopened"));
      utils.operations.customerListCases.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<SupportCaseRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "subject",
        accessorKey: "subject",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("subject")} />,
        cell: ({ row }) => (
          <span className="max-w-[240px] truncate font-medium text-sm">{row.original.subject}</span>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("category")} />,
        cell: ({ row }) => (
          <span className="text-sm">{CATEGORY_LABELS[row.original.category] ?? row.original.category}</span>
        ),
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("priority")} />,
        cell: ({ row }) => (
          <span className="capitalize text-sm">{PRIORITY_LABELS[row.original.priority] ?? row.original.priority}</span>
        ),
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("order")} />,
        cell: ({ row }) =>
          row.original.order_id ? (
            <Link href={`/console/orders/${row.original.order_id}`} className="font-mono text-xs hover:underline">
              {row.original.order_id.slice(0, 12)}…
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "assigned_to_user_id",
        accessorKey: "assigned_to_user_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("assigned_to")} />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status")} />,
        cell: ({ row }) => (
          <Badge variant={STATUS_STYLES[row.original.status] ?? "outline"}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date")} />,
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
                {r.order_id && (
                  <DropdownMenuItem asChild>
                    <Link href={`/console/orders/${r.order_id}`}>{t("view_order")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {(r.status === "open" || r.status === "assigned" || r.status === "in_progress") && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        resolveMutation.mutate({ case_id: r.id, resolution: t("resolved_by_operator") })
                      }
                    >
                      <CheckCircle2 className="mr-2 size-4 text-green-600" />
                      {t("resolve")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => closeMutation.mutate({ case_id: r.id })}>
                      <XCircle className="mr-2 size-4" />
                      {t("close")}
                    </DropdownMenuItem>
                  </>
                )}
                {(r.status === "resolved" || r.status === "closed") && (
                  <DropdownMenuItem
                    onClick={() =>
                      reopenMutation.mutate({ case_id: r.id, reason: t("manual_reopening") })
                    }
                  >
                    <RotateCcw className="mr-2 size-4" />
                    {t("reopen")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [resolveMutation, closeMutation, reopenMutation],
  );

  const { data, isLoading } = trpc.operations.customerListCases.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as SupportCaseRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "scPage", perPage: "scPerPage", sort: "scSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={1} />}>
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title={t("status")}
          options={STATUS_OPTIONS}
          value={status ?? undefined}
          onChange={(val) => setStatus(val)}
        />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2 border-t p-2">
          <Badge variant="outline">
            {t("selected_count", { count: table.getFilteredSelectedRowModel().rows.length })}
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/api/admin/support-cases/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="support-cases.csv"
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
