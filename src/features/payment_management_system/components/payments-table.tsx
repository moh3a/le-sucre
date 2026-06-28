"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import {
  Banknote,
  CreditCard,
  Download,
  MoreHorizontal,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { useTranslations } from "next-intl";

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
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type PaymentRow = {
  id: string;
  order_id: string;
  order_number: string | null;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  provider: string;
  type: string;
  status: string;
  currency: string;
  amount: string;
  fee: string;
  net_amount: string;
  refunded_amount: string;
  failure_reason: string | null;
  retry_count: number;
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

export function PaymentsTable() {
  const t = useTranslations("payments");
  const STATUS_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: t("pending"), variant: "outline" },
    processing: { label: t("processing"), variant: "secondary" },
    captured: { label: t("captured"), variant: "default" },
    completed: { label: t("completed"), variant: "default" },
    failed: { label: t("failed"), variant: "destructive" },
    refunded: { label: t("refunded"), variant: "secondary" },
    partially_refunded: { label: t("partially_refunded"), variant: "secondary" },
    cancelled: { label: t("cancelled"), variant: "destructive" },
    expired: { label: t("expired"), variant: "outline" },
    on_hold: { label: t("on_hold"), variant: "outline" },
  };
  const STATUS_OPTIONS = [
    { label: t("pending"), value: "pending" },
    { label: t("processing"), value: "processing" },
    { label: t("captured"), value: "captured" },
    { label: t("completed"), value: "completed" },
    { label: t("failed"), value: "failed" },
    { label: t("refunded"), value: "refunded" },
    { label: t("partially_refunded"), value: "partially_refunded" },
    { label: t("cancelled"), value: "cancelled" },
    { label: t("expired"), value: "expired" },
    { label: t("on_hold"), value: "on_hold" },
  ];
  const TYPE_OPTIONS = [
    { label: t("full"), value: "full" },
    { label: t("deposit"), value: "deposit" },
    { label: t("installment"), value: "installment" },
    { label: t("partial"), value: "partial" },
    { label: t("split"), value: "split" },
  ];

  const [page] = useQueryState("pmPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("pmPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("pmSearch", parseAsString);
  const [status, setStatus] = useQueryState("pmStatus", parseAsString);
  const [type, setType] = useQueryState("pmType", parseAsString);

  const utils = trpc.useUtils();

  const retryMutation = trpc.payments.adminRetry.useMutation({
    onSuccess: () => {
      toast.success("Paiement réessayé");
      utils.payments.adminList.invalidate();
      utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.payments.adminCancel.useMutation({
    onSuccess: () => {
      toast.success("Paiement annulé");
      utils.payments.adminList.invalidate();
      utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<PaymentRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("id_column")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/payments/${row.original.id}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.id.slice(0, 14)}…
          </Link>
        ),
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
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("customer_column")} />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{row.original.user_name ?? "—"}</span>
            {row.original.user_email && (
              <span className="text-muted-foreground text-xs">{row.original.user_email}</span>
            )}
          </div>
        ),
      },
      {
        id: "provider",
        accessorKey: "provider",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("provider_column")} />,
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.provider}
          </Badge>
        ),
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("amount_column")} />,
        cell: ({ row }) => (
          <span className="font-mono font-medium">
            {Number(row.original.amount).toLocaleString("fr-FR", {
              style: "currency",
              currency: row.original.currency,
            })}
          </span>
        ),
      },
      {
        id: "fee",
        accessorKey: "fee",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("fee_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-xs">
            {Number(row.original.fee).toLocaleString("fr-FR", {
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
                <Link href={`/console/payments/${row.original.id}`}>
                  <CreditCard className="mr-2 size-4" />
                  {t("view_details")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status === "failed" && (
                <DropdownMenuItem
                  onClick={() => retryMutation.mutate({ transaction_id: row.original.id })}
                >
                  <RefreshCcw className="mr-2 size-4" />
                  {t("retry")}
                </DropdownMenuItem>
              )}
              {(row.original.status === "pending" || row.original.status === "on_hold") && (
                <DropdownMenuItem
                  onClick={() => cancelMutation.mutate({ transaction_id: row.original.id })}
                >
                  <XCircle className="mr-2 size-4" />
                  {t("cancel")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [retryMutation, cancelMutation],
  );

  const { data, isLoading } = trpc.payments.adminList.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    type: type || undefined,
    search: search || undefined,
  });

  const items = (data?.items ?? []) as unknown as PaymentRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "pmPage", perPage: "pmPerPage", sort: "pmSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={3} />}>
      <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <Input
          placeholder={t("search_placeholder")}
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="max-w-sm"
        />
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
          icon={CreditCard}
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
              href={`/api/admin/payments/export?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(status ? { status } : {}),
                ...(type ? { type } : {}),
              })}`}
              download="payments.csv"
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
