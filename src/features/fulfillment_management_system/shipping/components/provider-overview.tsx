"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { CheckCircle2, Package, RefreshCcw, RotateCcw, Truck, XCircle } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { FacetedFilter } from "@/features/data-table/components/data-table-faceted-filter-simple";
import { useDataTable } from "@/features/data-table/use-data-table";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { ProviderStatusBucket, ShippingProviderName } from "../providers/contracts";

const PROVIDERS: ShippingProviderName[] = ["yalidine", "dhl", "fedex", "ups", "ems"];

const STATUS_BUCKET_BADGE: Record<ProviderStatusBucket, "default" | "secondary" | "destructive" | "outline"> = {
  in_transit: "secondary",
  delivered: "default",
  failed: "destructive",
  returned: "destructive",
  unknown: "outline",
};

const STATUS_OPTIONS = [
  { label: "En cours", value: "En cours" },
  { label: "Livré", value: "Livré" },
  { label: "Retour", value: "Retour" },
  { label: "Non livré", value: "Non livré" },
];

type ProviderRow = {
  provider_shipment_id: string;
  tracking_number: string;
  status_bucket: ProviderStatusBucket;
  label_url: string | null;
  recipient_name: string | undefined;
  city: string | undefined;
  price: string | undefined;
  updated_at: string | null;
};

export function ProviderOverview() {
  const t = useTranslations("shipping");

  const [provider, setProvider] = useQueryState("poProvider", parseAsString.withDefault("yalidine"));
  const [page, setPage] = useQueryState("poPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("poPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("poStatus", parseAsString.withDefault(""));

  const selected_provider = (provider || "yalidine") as ShippingProviderName;

  const { data, isLoading, error, refetch, isFetching } =
    trpc.shipping.providerOverview.useQuery({
      provider: selected_provider,
      page,
      page_size: per_page,
      status: status || undefined,
    });

  const columns = React.useMemo<ColumnDef<ProviderRow>[]>(
    () => [
      {
        id: "tracking_number",
        accessorKey: "tracking_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("tracking_number")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">{row.original.tracking_number}</span>
        ),
      },
      {
        id: "status_bucket",
        accessorKey: "status_bucket",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status")} />
        ),
        cell: ({ row }) => (
          <Badge variant={STATUS_BUCKET_BADGE[row.original.status_bucket] ?? "outline"}>
            {row.original.status_bucket}
          </Badge>
        ),
      },
      {
        id: "recipient",
        accessorKey: "recipient_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("recipient")} />
        ),
        cell: ({ row }) => <span className="text-sm">{row.original.recipient_name ?? "—"}</span>,
      },
      {
        id: "city",
        accessorKey: "city",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("city")} />,
        cell: ({ row }) => <span className="text-sm">{row.original.city ?? "—"}</span>,
      },
      {
        id: "price",
        accessorKey: "price",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("price")} />,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.price ? `${row.original.price} DZD` : "—"}</span>
        ),
      },
      {
        id: "updated_at",
        accessorKey: "updated_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("updated_at")} />
        ),
        cell: ({ row }) =>
          row.original.updated_at
            ? formatDate(row.original.updated_at, { month: "short" })
            : "—",
        meta: { label: "Date", icon: Truck },
      },
    ],
    [t],
  );

  const items = (data?.items ?? []) as ProviderRow[];
  const total_records = data?.meta.total ?? 0;
  const total_pages = Math.max(1, Math.ceil(total_records / per_page));

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: total_pages,
    initialState: { pagination: { pageIndex: 0, pageSize: per_page } },
    queryKeys: { page: "poPage", perPage: "poPerPage" },
    getRowId: (row) => row.tracking_number,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={6} rowCount={10} />}
    >
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("provider_overview_title")}</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selected_provider}
                onValueChange={(v) => {
                  setProvider(v);
                  void setPage(1);
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p} disabled={p !== "yalidine"}>
                      {p.toUpperCase()}
                      {p !== "yalidine" ? ` — ${t("not_available")}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void refetch()}
                disabled={isFetching}
                title={t("refresh")}
              >
                <RefreshCcw className={isFetching ? "size-4 animate-spin" : "size-4"} />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: t("stats_provider_total"),
              value: data?.stats.total ?? 0,
              icon: Truck,
              color: "info",
            },
            {
              label: t("stats_provider_in_transit"),
              value: data?.stats.in_transit ?? 0,
              icon: Package,
              color: "warning",
            },
            {
              label: t("stats_provider_delivered"),
              value: data?.stats.delivered ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: t("stats_provider_failed"),
              value: data?.stats.failed ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: t("stats_provider_returned"),
              value: data?.stats.returned ?? 0,
              icon: RotateCcw,
              color: "error",
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("provider_history_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable table={table}>
              <DataTableAdvancedToolbar table={table}>
                <FacetedFilter
                  title={t("status")}
                  options={STATUS_OPTIONS}
                  icon={Package}
                  value={status || null}
                  onChange={(value) => {
                    setStatus(value ?? "");
                    void setPage(1);
                  }}
                />
                <DataTableSortList table={table} />
              </DataTableAdvancedToolbar>
            </DataTable>
          </CardContent>
        </Card>
      </div>
    </QueryGuard>
  );
}
