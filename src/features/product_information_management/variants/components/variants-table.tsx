"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Archive,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  MoreHorizontal,
  Tag,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableViewOptions } from "@/features/data-table/components/data-table-view-options";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type SkuOption = {
  property_code: string;
  value_code: string;
  value_label: string;
  thumbnail_image: string | null;
  color_hex: string | null;
};

type SkuRow = {
  id: string;
  sku_code: string;
  barcode: string | null;
  base_price: string | null;
  offer_price: string | null;
  currency: string | null;
  is_active: boolean;
  stock_available: number;
  product_id: string;
  product_name: string | null;
  options: SkuOption[];
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

function RangeFilter({
  title,
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
}: {
  title: string;
  min: number;
  max: number;
  minValue?: number | null;
  maxValue?: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  unit?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {minValue != null || maxValue != null ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onMinChange(null);
                onMaxChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            <div className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {minValue != null || maxValue != null ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <span className="ml-1">
                {minValue != null ? minValue : "-"} - {maxValue != null ? maxValue : "-"}
                {unit ? ` ${unit}` : ""}
              </span>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Label htmlFor={`${title}-min`} className="sr-only">
                Min
              </Label>
              <Input
                id={`${title}-min`}
                type="number"
                placeholder={min.toString()}
                min={min}
                max={max}
                value={minValue ?? ""}
                onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : null)}
                className={unit ? "pr-8" : ""}
              />
              {unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {unit}
                </span>
              )}
            </div>
            <div className="relative flex-1">
              <Label htmlFor={`${title}-max`} className="sr-only">
                Max
              </Label>
              <Input
                id={`${title}-max`}
                type="number"
                placeholder={max.toString()}
                min={min}
                max={max}
                value={maxValue ?? ""}
                onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : null)}
                className={unit ? "pr-8" : ""}
              />
              {unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
          <Slider
            min={min}
            max={max}
            step={1}
            value={[minValue ?? min, maxValue ?? max]}
            onValueChange={([newMin, newMax]) => {
              onMinChange(newMin);
              onMaxChange(newMax);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function VariantsTable() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string) => {
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const columns = React.useMemo<ColumnDef<SkuRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Code SKU" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span>{row.original.sku_code}</span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-5 w-5"
              onClick={() => handleCopy(row.original.sku_code)}
            >
              {copiedId === row.original.sku_code ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Clipboard className="text-muted-foreground h-3 w-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        id: "product_name",
        accessorKey: "product_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Produit" />,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold">{row.original.product_name ?? "—"}</p>
            {row.original.barcode && (
              <p className="text-muted-foreground font-mono text-[10px]">
                Code-barres: {row.original.barcode}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "options",
        header: () => <span>Variations</span>,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.options.length === 0 ? (
              <span className="text-muted-foreground text-xs">—</span>
            ) : (
              row.original.options.map((opt) => (
                <Badge
                  key={`${opt.property_code}-${opt.value_code}`}
                  variant="outline"
                  className="gap-1 text-[10px]"
                >
                  {opt.color_hex ? (
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full border"
                      style={{ backgroundColor: opt.color_hex }}
                    />
                  ) : opt.thumbnail_image ? (
                    <img
                      src={opt.thumbnail_image}
                      alt=""
                      className="h-4 w-4 flex-shrink-0 rounded object-cover"
                    />
                  ) : null}
                  {opt.value_label || opt.value_code}
                </Badge>
              ))
            )}
          </div>
        ),
      },
      {
        id: "price",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Prix" />,
        cell: ({ row }) => {
          const base = row.original.base_price;
          const offer = row.original.offer_price;
          const currency = row.original.currency ?? "DZD";

          if (!base) return <span className="text-muted-foreground text-xs">—</span>;

          return (
            <div className="flex flex-col font-mono text-xs">
              {offer ? (
                <>
                  <span className="font-semibold text-emerald-600">
                    {Number(offer).toLocaleString("fr-FR")} {currency}
                  </span>
                  <span className="text-muted-foreground line-through text-[10px]">
                    {Number(base).toLocaleString("fr-FR")} {currency}
                  </span>
                </>
              ) : (
                <span className="font-semibold">
                  {Number(base).toLocaleString("fr-FR")} {currency}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "stock",
        accessorKey: "stock_available",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Stock" />,
        cell: ({ row }) => {
          const stock = row.original.stock_available;
          if (stock <= 0) {
            return <Badge variant="destructive">Rupture</Badge>;
          }
          return (
            <span
              className={
                stock < 10 ? "text-warning font-bold font-mono" : "font-mono font-semibold"
              }
            >
              {stock}
            </span>
          );
        },
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "outline" : "secondary"}>
            {row.original.is_active ? "Actif" : "Inactif"}
          </Badge>
        ),
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
              <DropdownMenuItem asChild>
                <Link href={`/console/products/${row.original.product_id}?tab=variants`}>
                  Gérer
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [copiedId],
  );

  const [page, setPage] = useQueryState("varPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("varPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("varSearch", parseAsString);
  const [status, setStatus] = useQueryState("varStatus", parseAsString);
  const [stock_min, setStockMin] = useQueryState("stock_min", parseAsInteger);
  const [stock_max, setStockMax] = useQueryState("stock_max", parseAsInteger);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.variants.adminList.useQuery({
    page,
    limit: per_page,
    status: status ?? undefined,
    search: search?.trim() || undefined,
  });

  const bulkUpdate = trpc.variants.bulkUpdateSku.useMutation({
    onSuccess: () => {
      utils.variants.adminList.invalidate();
      utils.variants.adminStats.invalidate();
    },
  });

  const bulkDelete = trpc.variants.bulkDeleteSku.useMutation({
    onSuccess: () => {
      utils.variants.adminList.invalidate();
      utils.variants.adminStats.invalidate();
    },
  });

  const items = (data?.items ?? []) as SkuRow[];
  const total_records = data?.meta.total_records ?? 0;
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "varPage", perPage: "varPerPage", sort: "varSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  const statusOptions = [
    { label: "Actif", value: "active" },
    { label: "Inactif", value: "inactive" },
  ];

  function runBulk(action: "activate" | "deactivate" | "delete") {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (!ids.length) return;
    if (action === "delete") {
      bulkDelete.mutate({ ids });
    } else {
      bulkUpdate.mutate({ ids, is_active: action === "activate" });
    }
  }

  if (isLoading && !data)
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={3} />;

  return (
    <>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder="Rechercher par SKU, produit, code-barres…"
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title="Statut"
            options={statusOptions}
            icon={Tag}
            value={status ?? undefined}
            onChange={(val) => setStatus(val)}
          />
          <RangeFilter
            title="Stock"
            min={0}
            max={10000}
            minValue={stock_min}
            maxValue={stock_max}
            onMinChange={setStockMin}
            onMaxChange={setStockMax}
          />
          <DataTableSortList table={table} />
          <DataTableViewOptions table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {table.getFilteredSelectedRowModel().rows.length} sélectionné(s)
            </Badge>
            <Button variant="secondary" size="sm" onClick={() => runBulk("activate")}>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Activer
            </Button>
            <Button variant="secondary" size="sm" onClick={() => runBulk("deactivate")}>
              <Archive className="mr-1 h-4 w-4" />
              Désactiver
            </Button>
            <Button variant="destructive" size="sm" onClick={() => runBulk("delete")}>
              <Archive className="mr-1 h-4 w-4" />
              Supprimer
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/variants/export?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                  ...(stock_min != null ? { stock_min: String(stock_min) } : {}),
                  ...(stock_max != null ? { stock_max: String(stock_max) } : {}),
                })}`}
                download="variants.csv"
              >
                <Download className="mr-1 h-4 w-4" />
                Exporter
              </a>
            </Button>
          </div>
        )}
      </DataTable>
    </>
  );
}
