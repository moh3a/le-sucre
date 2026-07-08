"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ExternalLink, RefreshCcw, ToggleLeft, Truck } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { FacetedFilter } from "@/features/data-table/components/data-table-faceted-filter-simple";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type ShipmentRow = {
  id: string;
  order_id: string;
  order_number: string;
  provider: string;
  tracking_number: string | null;
  tracking_url: string | null;
  status: string;
  delivery_status: string;
  recipient_name: string;
  recipient_phone: string;
  city: string;
  country_code: string;
  shipping_cost: string;
  currency: string;
  last_sync_at: string | null;
  created_at: string;
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  dispatched: "secondary",
  in_transit: "default",
  delivered: "default",
  failed: "destructive",
};

const DELIVERY_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  out_for_delivery: "secondary",
  delivered: "default",
  failed: "destructive",
};

export function ShippingTable({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("shipping");
  const utils = trpc.useUtils();

  const sync_mutation = trpc.shipping.sync.useMutation({
    onSuccess: () => {
      toast.success(t("sync_success"));
      void utils.shipping.adminList.invalidate();
      void utils.shipping.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<ShipmentRow>[]>(
    () => [
      {
        id: "tracking_number",
        accessorKey: "tracking_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("tracking_number")} />
        ),
        cell: ({ row }) => (
          <Link
            href={`/console/shipping/${row.original.id}`}
            className="font-mono text-sm font-medium hover:underline"
          >
            {row.original.tracking_number ?? "—"}
          </Link>
        ),
      },
      {
        id: "order_number",
        accessorKey: "order_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("order")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/orders/${row.original.order_id}`}
            className="font-mono text-sm hover:underline"
          >
            {row.original.order_number}
          </Link>
        ),
      },
      {
        id: "provider",
        accessorKey: "provider",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("provider")} />,
        cell: ({ row }) => <Badge variant="outline">{row.original.provider}</Badge>,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status")} />,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status] ?? "secondary"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "delivery_status",
        accessorKey: "delivery_status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("delivery")} />,
        cell: ({ row }) => (
          <Badge variant={DELIVERY_BADGE[row.original.delivery_status] ?? "outline"}>
            {row.original.delivery_status}
          </Badge>
        ),
      },
      {
        id: "recipient",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("recipient")} />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.recipient_name}</span>
            <span className="text-muted-foreground text-xs">{row.original.recipient_phone}</span>
          </div>
        ),
      },
      {
        id: "city",
        accessorKey: "city",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("city")} />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.city}, {row.original.country_code}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("created_at")} />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
        meta: { label: "Date", icon: Truck },
      },
      {
        id: "actions",
        header: t("actions"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.tracking_url ? (
              <Button variant="ghost" size="icon" asChild>
                <a href={row.original.tracking_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              disabled={!row.original.tracking_number || sync_mutation.isPending}
              onClick={() => sync_mutation.mutate({ shipment_id: row.original.id })}
            >
              <RefreshCcw className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [sync_mutation, t],
  );

  const [page] = useQueryState("shipPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("shipPerPage", parseAsInteger.withDefault(compact ? 5 : 10));
  const [status_filter, setStatusFilter] = useQueryState(
    "shipStatus",
    parseAsString.withDefault(""),
  );

  const status = status_filter || undefined;

  const { data, isLoading, error } = trpc.shipping.adminList.useQuery({
    page,
    limit: per_page,
    status,
  });

  const items = (data?.items ?? []) as ShipmentRow[];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 0,
    queryKeys: { page: "shipPage", perPage: "shipPerPage" },
    getRowId: (row) => row.id,
  });

  const statusOptions = [
    { label: t("draft"), value: "draft" },
    { label: t("dispatched"), value: "dispatched" },
    { label: t("in_transit"), value: "in_transit" },
    { label: t("delivered"), value: "delivered" },
    { label: t("failed"), value: "failed" },
  ];

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={9} rowCount={compact ? 5 : 10} />}
    >
      <DataTable table={table}>
        {!compact ? (
          <DataTableAdvancedToolbar table={table}>
            <FacetedFilter
              title={t("status")}
              options={statusOptions}
              icon={ToggleLeft}
              value={status_filter || null}
              onChange={(value) => setStatusFilter(value ?? "")}
            />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        ) : null}
      </DataTable>
    </QueryGuard>
  );
}
