"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import {
  Ban,
  Banknote,
  CheckCircle2,
  Download,
  MoreHorizontal,
  RefreshCcw,
  XCircle,
} from "lucide-react";
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
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type RefundRow = {
  id: string;
  transaction_id: string;
  order_id: string;
  order_number: string | null;
  user_name: string | null;
  type: string;
  status: string;
  reason: string | null;
  currency: string;
  amount: string;
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
  const STATUS_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: t("pending"), variant: "outline" },
    approved: { label: t("approved"), variant: "secondary" },
    rejected: { label: t("rejected"), variant: "destructive" },
    processing: { label: t("processing"), variant: "secondary" },
    completed: { label: t("completed"), variant: "default" },
    failed: { label: t("failed"), variant: "destructive" },
  };
  const STATUS_OPTIONS = [
    { label: t("pending"), value: "pending" },
    { label: t("approved"), value: "approved" },
    { label: t("rejected"), value: "rejected" },
    { label: t("processing"), value: "processing" },
    { label: t("completed"), value: "completed" },
    { label: t("failed"), value: "failed" },
  ];
  const TYPE_OPTIONS = [
    { label: t("full"), value: "full" },
    { label: t("partial"), value: "partial" },
    { label: t("sku_level"), value: "sku_level" },
  ];

  const [page] = useQueryState("rfPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("rfPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("rfStatus", parseAsString);
  const [type, setType] = useQueryState("rfType", parseAsString);

  const utils = trpc.useUtils();

  const approveMutation = trpc.payments.adminApproveRefund.useMutation({
    onSuccess: () => {
      toast.success("Remboursement approuvé");
      utils.payments.adminListRefunds.invalidate();
      utils.payments.adminRefundStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.payments.adminRejectRefund.useMutation({
    onSuccess: () => {
      toast.success("Remboursement rejeté");
      utils.payments.adminListRefunds.invalidate();
      utils.payments.adminRefundStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const processMutation = trpc.payments.adminProcessRefund.useMutation({
    onSuccess: () => {
      toast.success("Remboursement traité");
      utils.payments.adminListRefunds.invalidate();
      utils.payments.adminRefundStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<RefundRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "order",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("order_column")} />,
        cell: ({ row }) => {
          const on = row.original.order_number;
          return on ? (
            <Link
              href={`/console/orders/${row.original.order_id}`}
              className="font-medium text-sm hover:underline"
            >
              #{on}
            </Link>
          ) : (
            <span className="font-mono text-xs">{row.original.order_id.slice(0, 10)}…</span>
          );
        },
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
        id: "type",
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("type_column")} />,
        cell: ({ row }) => <span className="capitalize text-sm">{row.original.type}</span>,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_column")} />,
        cell: ({ row }) => {
          const cfg = STATUS_STYLES[row.original.status] ?? {
            label: row.original.status,
            variant: "outline" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("customer_column")} />,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.user_name ?? "—"}</span>
        ),
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("reason_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.reason ?? "—"}
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
              {(row.original.status === "pending" || row.original.status === "rejected") && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      approveMutation.mutate({ refund_id: row.original.id })
                    }
                  >
                    <CheckCircle2 className="mr-2 size-4 text-green-600" />
                    {t("approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      rejectMutation.mutate({ refund_id: row.original.id, reason: t("rejected") })
                    }
                  >
                    <Ban className="mr-2 size-4 text-red-600" />
                    {t("reject")}
                  </DropdownMenuItem>
                </>
              )}
              {row.original.status === "approved" && (
                <DropdownMenuItem
                  onClick={() =>
                    processMutation.mutate({ refund_id: row.original.id })
                  }
                >
                  <RefreshCcw className="mr-2 size-4" />
                  {t("process")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/console/orders/${row.original.order_id}`}>
                  {t("view_order")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [approveMutation, rejectMutation, processMutation],
  );

  const { data, isLoading } = trpc.payments.adminListRefunds.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    type: type || undefined,
  });

  const items = (data?.items ?? []) as unknown as RefundRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "rfPage", perPage: "rfPerPage", sort: "rfSort" },
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
          icon={Banknote}
          value={status ?? undefined}
          onChange={(val) => setStatus(val)}
        />
        <FacetedFilter
          title={t("type_title")}
          options={TYPE_OPTIONS}
          value={type ?? undefined}
          onChange={(val) => setType(val)}
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
              href={`/api/admin/refunds/export?${new URLSearchParams({
                ...(status ? { status } : {}),
                ...(type ? { type } : {}),
              })}`}
              download="refunds.csv"
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
