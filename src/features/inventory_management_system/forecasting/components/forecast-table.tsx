"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { XCircle } from "lucide-react";
import { formatDate } from "@/lib/format";

type ForecastRow = {
  sku_id: string;
  sku_code: string;
  product_name: string | null;
  avg_daily_sales: string;
  days_until_stockout: number | null;
  recommended_reorder_qty: number;
  safety_stock: number;
  risk_level: string;
  computed_at: string;
  current_stock: number | null;
  reserved_stock: number | null;
};

interface Option {
  label: string;
  value: string;
}

const RISK_OPTIONS: Option[] = [
  { label: "Critique", value: "critical" },
  { label: "Élevé", value: "high" },
  { label: "Normal", value: "normal" },
  { label: "Faible", value: "low" },
];

const RISK_BADGES: Record<string, { label: string; variant: "destructive" | "secondary" | "default" | "outline" }> = {
  critical: { label: "Critique", variant: "destructive" },
  high: { label: "Élevé", variant: "secondary" },
  normal: { label: "Normal", variant: "default" },
  low: { label: "Faible", variant: "outline" },
};

const RISK_SORT_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

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

export function ForecastTable() {
  const [page, setPage] = useQueryState("fcPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("fcPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("fcSearch", parseAsString);
  const [risk_level, setRiskLevel] = useQueryState("fcRisk", parseAsString);

  const { data, isLoading } = trpc.forecast.dashboard.useQuery({
    risk_level: risk_level ?? undefined,
    page,
    limit: per_page,
  });

  const columns = React.useMemo<ColumnDef<ForecastRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "product_name",
        accessorKey: "product_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Produit" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.product_name ?? "—"}</span>
        ),
      },
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Code SKU" />,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku_code}</span>,
      },
      {
        id: "risk_level",
        accessorKey: "risk_level",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Niveau de Risque" />,
        cell: ({ row }) => {
          const cfg = RISK_BADGES[row.original.risk_level] ?? {
            label: row.original.risk_level,
            variant: "outline" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "avg_daily_sales",
        accessorKey: "avg_daily_sales",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Ventes Journalières" />
        ),
        cell: ({ row }) => Number(row.original.avg_daily_sales).toFixed(2),
      },
      {
        id: "current_stock",
        accessorKey: "current_stock",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Stock Actuel" />,
        cell: ({ row }) =>
          row.original.current_stock != null ? (
            <Badge
              variant={
                row.original.current_stock === 0
                  ? "destructive"
                  : (row.original.current_stock ?? 0) <= 5
                    ? "outline"
                    : "default"
              }
            >
              {row.original.current_stock}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        id: "reserved_stock",
        accessorKey: "reserved_stock",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Réservé" />,
        cell: ({ row }) =>
          row.original.reserved_stock != null ? (
            <span className="text-muted-foreground text-sm">{row.original.reserved_stock}</span>
          ) : (
            "—"
          ),
      },
      {
        id: "days_until_stockout",
        accessorKey: "days_until_stockout",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Jours Avant Rupture" />
        ),
        cell: ({ row }) => {
          const days = row.original.days_until_stockout;
          if (days == null) return "—";
          return days <= 0 ? (
            <span className="text-destructive font-bold">En rupture</span>
          ) : (
            <span
              className={
                days < 10
                  ? "text-destructive font-semibold"
                  : days < 30
                    ? "text-warning font-semibold"
                    : ""
              }
            >
              {days} jours
            </span>
          );
        },
      },
      {
        id: "recommended_reorder_qty",
        accessorKey: "recommended_reorder_qty",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Qte Réappro." />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.recommended_reorder_qty.toLocaleString("fr-FR")}
          </span>
        ),
      },
      {
        id: "safety_stock",
        accessorKey: "safety_stock",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Stock Sécurité" />
        ),
        cell: ({ row }) => row.original.safety_stock.toLocaleString("fr-FR"),
      },
      {
        id: "computed_at",
        accessorKey: "computed_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date Calcul" />,
        cell: ({ row }) => formatDate(row.original.computed_at, { month: "short" }),
      },
    ],
    [],
  );

  const items = ((data?.items ?? []) as ForecastRow[]).filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesProduct = item.product_name?.toLowerCase().includes(q);
      const matchesSku = item.sku_code.toLowerCase().includes(q);
      if (!matchesProduct && !matchesSku) return false;
    }
    return true;
  }).sort((a, b) => {
    const aOrder = RISK_SORT_ORDER[a.risk_level] ?? 0;
    const bOrder = RISK_SORT_ORDER[b.risk_level] ?? 0;
    if (bOrder !== aOrder) return bOrder - aOrder;
    return (a.days_until_stockout ?? 9999) - (b.days_until_stockout ?? 9999);
  });
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items as ForecastRow[],
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "fcPage", perPage: "fcPerPage", sort: "fcSort" },
    getRowId: (row) => row.sku_id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={2} />}
    >
      <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <Input
          placeholder="Rechercher par produit ou SKU…"
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <FacetedFilter
          title="Niveau de Risque"
          options={RISK_OPTIONS}
          icon={XCircle}
          value={risk_level ?? undefined}
          onChange={(val) => {
            setRiskLevel(val);
            setPage(1);
          }}
        />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
    </QueryGuard>
  );
}
