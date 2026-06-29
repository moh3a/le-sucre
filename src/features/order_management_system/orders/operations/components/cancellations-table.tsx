"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Ban, CheckCircle2, Download, MoreHorizontal, XCircle } from "lucide-react";
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
  approved: "destructive",
  rejected: "default",
};

type CancellationRow = {
  id: string;
  order_id: string;
  requested_by_user_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by_user_id: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  refund_processed: boolean;
  refund_amount: string | null;
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

export function CancellationsTable() {
  const t = useTranslations("cancellations");
  const [page] = useQueryState("cnPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("cnPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("cnStatus", parseAsString);

  const STATUS_OPTIONS = React.useMemo(
    () => [
      { label: t("status_pending"), value: "pending" },
      { label: t("status_approved"), value: "approved" },
      { label: t("status_rejected"), value: "rejected" },
    ],
    [t],
  );

  const utils = trpc.useUtils();

  const reviewMutation = trpc.operations.orderReviewCancellation.useMutation({
    onSuccess: () => {
      toast.success(t("cancel_updated"));
      utils.operations.orderListCancellationRequests.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<CancellationRow>[]>(
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
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.description ?? "—"}
          </span>
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
        id: "review_note",
        accessorKey: "review_note",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("notes_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[160px] truncate text-xs">
            {row.original.review_note ?? "—"}
          </span>
        ),
      },
      {
        id: "refund_amount",
        accessorKey: "refund_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("refund_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.refund_amount
              ? Number(row.original.refund_amount).toLocaleString("fr-DZ", {
                  style: "currency",
                  currency: "DZD",
                })
              : "—"}
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
              {row.original.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      reviewMutation.mutate({
                        cancellation_request_id: row.original.id,
                        status: "approved",
                      })
                    }
                  >
                    <CheckCircle2 className="mr-2 size-4 text-green-600" />
                    {t("approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      reviewMutation.mutate({
                        cancellation_request_id: row.original.id,
                        status: "rejected",
                      })
                    }
                  >
                    <XCircle className="mr-2 size-4 text-red-600" />
                    {t("reject")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [reviewMutation],
  );

  const { data, isLoading } = trpc.operations.orderListCancellationRequests.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as CancellationRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "cnPage", perPage: "cnPerPage", sort: "cnSort" },
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
            {t("rows_selected", { count: table.getFilteredSelectedRowModel().rows.length })}
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/api/admin/cancellations/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="cancellations.csv"
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
