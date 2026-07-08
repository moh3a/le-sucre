"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Check, Eye, MoreHorizontal } from "lucide-react";
import * as React from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { XCircle } from "lucide-react";
import { formatDate } from "@/lib/format";

type AlertRow = {
  id: string;
  sku_id: string;
  warehouse_id: string;
  alert_type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  product_name: string | null;
};

interface Option {
  label: string;
  value: string;
}

function FacetedFilter({
  title,
  options,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
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

export function AlertsTable({ status }: { status?: string }) {
  const t = useTranslations("forecast");
  const [page, setPage] = useQueryState("alPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("alPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("alSearch", parseAsString);
  const [severity, setSeverity] = useQueryState("alSeverity", parseAsString);
  const [alert_type, setAlertType] = useQueryState("alType", parseAsString);

  const utils = trpc.useUtils();

  const ackMutation = trpc.forecast.ackAlert.useMutation({
    onSuccess: () => {
      utils.forecast.alerts.invalidate();
      utils.forecast.alertStats.invalidate();
    },
  });

  const resolveMutation = trpc.forecast.resolveAlert.useMutation({
    onSuccess: () => {
      utils.forecast.alerts.invalidate();
      utils.forecast.alertStats.invalidate();
    },
  });

  const severityOptions: Option[] = [
    { label: t("alert_severity_critical"), value: "critical" },
    { label: t("alert_severity_warning"), value: "warning" },
    { label: t("alert_severity_info"), value: "info" },
  ];

  const alertTypeOptions: Option[] = [
    { label: t("alert_type_low_stock"), value: "low_stock" },
    { label: t("alert_type_stockout_predicted"), value: "stockout_predicted" },
    { label: t("alert_type_reorder"), value: "reorder" },
  ];

  const severityBadges: Record<
    string,
    { label: string; variant: "destructive" | "secondary" | "default" | "outline" }
  > = React.useMemo(
    () => ({
      critical: { label: t("alert_severity_critical"), variant: "destructive" },
      warning: { label: t("alert_severity_warning"), variant: "secondary" },
      info: { label: t("alert_severity_info"), variant: "default" },
    }),
    [t],
  );

  const columns = React.useMemo<ColumnDef<AlertRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "product_name",
        accessorKey: "product_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("alert_product_column")} />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.product_name ?? "—"}</span>
        ),
      },
      {
        id: "sku_id",
        accessorKey: "sku_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("alert_sku_column")} />
        ),
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku_id}</span>,
      },
      {
        id: "severity",
        accessorKey: "severity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("alert_severity_column")} />
        ),
        cell: ({ row }) => {
          const cfg = severityBadges[row.original.severity] ?? {
            label: row.original.severity,
            variant: "outline" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "alert_type",
        accessorKey: "alert_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("alert_type_column")} />
        ),
        cell: ({ row }) => (
          <span className="text-sm capitalize">{row.original.alert_type.replace(/_/g, " ")}</span>
        ),
      },
      {
        id: "message",
        accessorKey: "message",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("alert_message_column")} />
        ),
        cell: ({ row }) => (
          <span className="max-w-xs truncate text-sm">{row.original.message}</span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("alert_detected_column")} />
        ),
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const alert = row.original;
          if (alert.status === "resolved") {
            return (
              <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <Check className="h-4 w-4 text-emerald-500" /> {t("alert_resolved")}
              </span>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {alert.status === "open" && (
                  <DropdownMenuItem
                    disabled={ackMutation.isPending}
                    onClick={() => ackMutation.mutate({ id: alert.id })}
                  >
                    <Eye className="mr-2 size-4" />
                    {t("alert_acknowledge")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={resolveMutation.isPending}
                  onClick={() => resolveMutation.mutate({ id: alert.id })}
                >
                  <Check className="mr-2 size-4 text-emerald-600" />
                  {t("alert_resolve")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [ackMutation, resolveMutation, severityBadges, t],
  );

  const { data, isLoading } = trpc.forecast.alerts.useQuery({
    status: status ?? undefined,
    page,
    limit: per_page,
  });

  const items = ((data?.items ?? []) as AlertRow[]).filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesProduct = item.product_name?.toLowerCase().includes(q);
      const matchesMessage = item.message.toLowerCase().includes(q);
      const matchesSku = item.sku_id.toLowerCase().includes(q);
      if (!matchesProduct && !matchesMessage && !matchesSku) return false;
    }
    if (severity && item.severity !== severity) return false;
    if (alert_type && item.alert_type !== alert_type) return false;
    return true;
  });
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items as AlertRow[],
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "alPage", perPage: "alPerPage", sort: "alSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  function runBulk(action: "ack" | "resolve") {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (!ids.length) return;
    ids.forEach((id) => {
      if (action === "ack") {
        ackMutation.mutate({ id });
      } else {
        resolveMutation.mutate({ id });
      }
    });
  }

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_placeholder_alerts")}
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title={t("severity_title")}
            options={severityOptions}
            icon={XCircle}
            value={severity ?? undefined}
            onChange={(val) => {
              setSeverity(val);
              setPage(1);
            }}
          />
          <FacetedFilter
            title={t("alert_type_title")}
            options={alertTypeOptions}
            icon={XCircle}
            value={alert_type ?? undefined}
            onChange={(val) => {
              setAlertType(val);
              setPage(1);
            }}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">{table.getFilteredSelectedRowModel().rows.length}</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => runBulk("ack")}
              disabled={ackMutation.isPending || resolveMutation.isPending}
            >
              <Eye className="mr-1 h-4 w-4" />
              {t("alert_acknowledge")}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => runBulk("resolve")}
              disabled={ackMutation.isPending || resolveMutation.isPending}
            >
              <Check className="mr-1 h-4 w-4" />
              {t("alert_resolve")}
            </Button>
          </div>
        )}
      </DataTable>
    </QueryGuard>
  );
}
