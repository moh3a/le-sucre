"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { CheckCircle2, Download, MoreHorizontal, XCircle } from "lucide-react";
import Link from "next/link";

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
import { Input } from "@/components/ui/input";
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
  open: "destructive",
  in_review: "secondary",
  resolved: "default",
  dismissed: "outline",
};

const PRIORITY_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  urgent: "destructive",
  high: "destructive",
  normal: "secondary",
  low: "outline",
};

type EscalationRow = {
  id: string;
  order_id: string;
  reason: string;
  description: string | null;
  priority: string;
  status: string;
  escalated_by_user_id: string;
  assigned_to_user_id: string | null;
  resolution: string | null;
  resolved_by_user_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
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

export function EscalationsTable() {
  const t = useTranslations("escalations");
  const [page] = useQueryState("escPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("escPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("escStatus", parseAsString);
  const [priority, setPriority] = useQueryState("escPriority", parseAsString);

  const STATUS_OPTIONS = React.useMemo(
    () => [
      { label: t("status_open"), value: "open" },
      { label: t("status_in_review"), value: "in_review" },
      { label: t("status_resolved"), value: "resolved" },
      { label: t("status_dismissed"), value: "dismissed" },
    ],
    [t],
  );

  const PRIORITY_OPTIONS = React.useMemo(
    () => [
      { label: t("priority_urgent"), value: "urgent" },
      { label: t("priority_high"), value: "high" },
      { label: t("priority_normal"), value: "normal" },
      { label: t("priority_low"), value: "low" },
    ],
    [t],
  );

  const utils = trpc.useUtils();

  const resolveMutation = trpc.operations.orderResolveEscalation.useMutation({
    onSuccess: () => {
      toast.success(t("escalation_updated"));
      utils.operations.orderListEscalations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<EscalationRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("order_column")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/orders/${row.original.order_id}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.order_id.slice(0, 12)}…
          </Link>
        ),
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("reason_column")} />,
        cell: ({ row }) => (
          <span className="text-sm">
            {t(`reason_${row.original.reason}`)}
          </span>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("details_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[240px] truncate text-xs">
            {row.original.description ?? "—"}
          </span>
        ),
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("priority_title")} />,
        cell: ({ row }) => (
          <Badge variant={PRIORITY_STYLES[row.original.priority] ?? "outline"}>
            {t(`priority_${row.original.priority}`)}
          </Badge>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_title")} />,
        cell: ({ row }) => (
          <Badge variant={STATUS_STYLES[row.original.status] ?? "outline"}>
            {t(`status_${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "assigned_to_user_id",
        accessorKey: "assigned_to_user_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("assigned_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.assigned_to_user_id?.slice(0, 12) ?? "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date_column")} />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
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
              <DropdownMenuLabel>{t("actions_title")}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/console/orders/${row.original.order_id}`}>
                  {t("view_order")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {(row.original.status === "open" || row.original.status === "in_review") && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      resolveMutation.mutate({
                        id: row.original.id,
                        resolution: "Résolu",
                        status: "resolved",
                      })
                    }
                  >
                    <CheckCircle2 className="mr-2 size-4 text-green-600" />
                    {t("resolve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      resolveMutation.mutate({
                        id: row.original.id,
                        resolution: "Rejeté",
                        status: "dismissed",
                      })
                    }
                  >
                    <XCircle className="mr-2 size-4 text-red-600" />
                    {t("dismiss")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [resolveMutation],
  );

  const { data, isLoading } = trpc.operations.orderListEscalations.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as EscalationRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "escPage", perPage: "escPerPage", sort: "escSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={2} />}>
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title={t("status_title")}
          options={STATUS_OPTIONS}
          value={status ?? undefined}
          onChange={(val) => setStatus(val)}
        />
        <FacetedFilter
          title={t("priority_title")}
          options={PRIORITY_OPTIONS}
          value={priority ?? undefined}
          onChange={(val) => setPriority(val)}
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
              href={`/api/admin/escalations/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="escalations.csv"
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
