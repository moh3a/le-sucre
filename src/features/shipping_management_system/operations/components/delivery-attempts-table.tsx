"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Download, MoreHorizontal, RotateCcw, Warehouse, XCircle } from "lucide-react";
import Link from "next/link";

import { useTranslations } from "next-intl";

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

const STATUS_LABELS: Record<string, string> = {
  successful: "Livré",
  failed: "Échoué",
  customer_unavailable: "Client absent",
  wrong_address: "Mauvaise adresse",
  refused: "Refusé",
  cancelled: "Annulé",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  successful: "default",
  failed: "destructive",
  customer_unavailable: "secondary",
  wrong_address: "outline",
  refused: "destructive",
  cancelled: "outline",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value,
}));

type DeliveryAttemptRow = {
  id: string;
  shipment_id: string;
  order_id: string;
  attempt_number: number;
  status: string;
  description: string | null;
  delivery_person_id: string | null;
  attempted_at: string;
  next_attempt_at: string | null;
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

export function DeliveryAttemptsTable() {
  const t = useTranslations("delivery_attempts");
  const [page] = useQueryState("dvPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("dvPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("dvStatus", parseAsString);

  const utils = trpc.useUtils();

  const retryMutation = trpc.operations.deliveryRetry.useMutation({
    onSuccess: () => {
      toast.success("Nouvelle tentative programmée");
      utils.operations.deliveryListAttempts.invalidate();
      utils.operations.deliveryGetStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rtoMutation = trpc.operations.deliveryReturnToWarehouse.useMutation({
    onSuccess: () => {
      toast.success("Retour entrepôt initié");
      utils.operations.deliveryListAttempts.invalidate();
      utils.operations.deliveryGetStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<DeliveryAttemptRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("order")} />,
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
        id: "attempt_number",
        accessorKey: "attempt_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("attempt")} />,
        cell: ({ row }) => (
          <span className="text-sm">#{row.original.attempt_number}</span>
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
        id: "description",
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("description")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[180px] truncate text-xs">
            {row.original.description ?? "—"}
          </span>
        ),
      },
      {
        id: "delivery_person_id",
        accessorKey: "delivery_person_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("delivery_person")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.delivery_person_id
              ? `${row.original.delivery_person_id.slice(0, 10)}…`
              : "—"}
          </span>
        ),
      },
      {
        id: "attempted_at",
        accessorKey: "attempted_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("attempt_date")} />,
        cell: ({ row }) => formatDate(row.original.attempted_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: "next_attempt_at",
        accessorKey: "next_attempt_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("next_attempt")} />,
        cell: ({ row }) =>
          row.original.next_attempt_at
            ? formatDate(row.original.next_attempt_at, { month: "short", day: "numeric", hour: "2-digit" })
            : <span className="text-muted-foreground">—</span>,
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
                <DropdownMenuItem asChild>
                  <Link href={`/console/orders/${r.order_id}`}>{t("view_order")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {r.status !== "successful" && r.status !== "cancelled" && (
                  <DropdownMenuItem
                    onClick={() =>
                      retryMutation.mutate({
                        order_id: r.order_id,
                        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
                      })
                    }
                  >
                    <RotateCcw className="mr-2 size-4" />
                    {t("reschedule")}
                  </DropdownMenuItem>
                )}
                {r.status !== "successful" && r.status !== "cancelled" && (
                  <DropdownMenuItem
                    onClick={() =>
                      rtoMutation.mutate({ order_id: r.order_id })
                    }
                  >
                    <Warehouse className="mr-2 size-4" />
                    {t("return_warehouse")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [retryMutation, rtoMutation],
  );

  const { data, isLoading, error } = trpc.operations.deliveryListAttempts.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as DeliveryAttemptRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "dvPage", perPage: "dvPerPage", sort: "dvSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={1} />}>
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
              href={`/api/admin/delivery-attempts/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="delivery-attempts.csv"
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
