"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { CheckCircle2, Download, MoreHorizontal, RefreshCcw, XCircle } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { QueryGuard } from "@/components/query-guard";
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
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type RefundRequestRow = {
  id: string;
  order_id: string;
  return_request_id: string | null;
  cancellation_request_id: string | null;
  status: string;
  amount: string;
  currency: string;
  refund_method: string | null;
  reason: string;
  rejection_reason: string | null;
  provider_reference: string | null;
  requested_by_user_id: string;
  approved_by_user_id: string | null;
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

export function RefundsTable() {
  const t = useTranslations("refunds");
  const STATUS_LABELS: Record<string, string> = {
    pending: t("pending"),
    approved: t("approved"),
    processing: t("processing"),
    completed: t("completed"),
    failed: t("failed"),
    rejected: t("rejected"),
  };
  const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    approved: "secondary",
    processing: "secondary",
    completed: "default",
    failed: "destructive",
    rejected: "destructive",
  };
  const STATUS_OPTIONS = [
    { label: t("pending"), value: "pending" },
    { label: t("approved"), value: "approved" },
    { label: t("processing"), value: "processing" },
    { label: t("completed"), value: "completed" },
    { label: t("failed"), value: "failed" },
    { label: t("rejected"), value: "rejected" },
  ];

  const [page] = useQueryState("rrPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("rrPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("rrStatus", parseAsString);

  const utils = trpc.useUtils();

  const approveMutation = trpc.operations.paymentApproveRefund.useMutation({
    onSuccess: () => {
      toast.success("Remboursement approuvé");
      utils.operations.paymentListRefundRequests.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const processMutation = trpc.operations.paymentProcessRefund.useMutation({
    onSuccess: () => {
      toast.success("Remboursement traité");
      utils.operations.paymentListRefundRequests.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<RefundRequestRow>[]>(
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
        id: "amount",
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("amount_column")} />,
        cell: ({ row }) => (
          <span className="font-mono font-medium">
            {Number(row.original.amount).toLocaleString("fr-DZ", {
              style: "currency",
              currency: row.original.currency,
            })}
          </span>
        ),
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("reason_column")} />,
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate text-sm">{row.original.reason}</span>
        ),
      },
      {
        id: "refund_method",
        accessorKey: "refund_method",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("method_column")} />,
        cell: ({ row }) => (
          <span className="capitalize text-sm">{row.original.refund_method ?? "—"}</span>
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
        id: "rejection_reason",
        accessorKey: "rejection_reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("rejection_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[160px] truncate text-xs">
            {row.original.rejection_reason ?? "—"}
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
              <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/console/orders/${row.original.order_id}`}>
                  {t("view_order")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status === "pending" && (
                <DropdownMenuItem
                  onClick={() =>
                    approveMutation.mutate({ id: row.original.id })
                  }
                >
                  <CheckCircle2 className="mr-2 size-4 text-green-600" />
                  {t("approve")}
                </DropdownMenuItem>
              )}
              {row.original.status === "approved" && (
                <DropdownMenuItem
                  onClick={() =>
                    processMutation.mutate({ id: row.original.id, status: "completed" })
                  }
                >
                  <RefreshCcw className="mr-2 size-4" />
                  {t("process")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [approveMutation, processMutation],
  );

  const { data, isLoading } = trpc.operations.paymentListRefundRequests.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as RefundRequestRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "rrPage", perPage: "rrPerPage", sort: "rrSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />}>
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
            {t("selected_count", { count: table.getFilteredSelectedRowModel().rows.length })}
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/api/admin/refund-requests/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="refund-requests.csv"
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
