"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Download, MoreHorizontal, Pencil, Play, Square, Trash2 } from "lucide-react";
import Link from "next/link";

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

type PromotionRow = {
  id: string;
  name: string;
  slug: string;
  promotion_type: string;
  status: string;
  priority: number;
  is_stackable: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  usage_count: number;
  total_discount: string;
};

interface Option {
  label: string;
  value: string;
}

const TYPE_OPTIONS: Option[] = [
  { label: "Code Promo", value: "promo_code" },
  { label: "Automatique", value: "automatic" },
  { label: "Vente Flash", value: "flash_sale" },
  { label: "Bundle", value: "bundle" },
  { label: "Client Spécifique", value: "customer" },
];

const STATUS_OPTIONS: Option[] = [
  { label: "Actif", value: "active" },
  { label: "Brouillon", value: "draft" },
  { label: "Planifié", value: "scheduled" },
  { label: "En Pause", value: "paused" },
  { label: "Expiré", value: "expired" },
];

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  scheduled: { label: "Planifié", variant: "outline" },
  active: { label: "Actif", variant: "default" },
  paused: { label: "En Pause", variant: "destructive" },
  expired: { label: "Expiré", variant: "secondary" },
};

const TYPE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  promo_code: { label: "Code Promo", variant: "default" },
  automatic: { label: "Automatique", variant: "secondary" },
  flash_sale: { label: "Vente Flash", variant: "outline" },
  bundle: { label: "Bundle", variant: "outline" },
  customer: { label: "Client Spécifique", variant: "secondary" },
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

export function PromotionsTable() {
  const [page, setPage] = useQueryState("pmPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("pmPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("pmSearch", parseAsString);
  const [status, setStatus] = useQueryState("pmStatus", parseAsString);
  const [promotion_type, setPromotionType] = useQueryState("pmType", parseAsString);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.promotions.adminList.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
    status: status || undefined,
    promotion_type: promotion_type || undefined,
  });

  const columns = React.useMemo<ColumnDef<PromotionRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Nom" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`/console/promotions/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.name}
            </Link>
            <span className="text-muted-foreground font-mono text-xs">{row.original.slug}</span>
          </div>
        ),
      },
      {
        id: "promotion_type",
        accessorKey: "promotion_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
        cell: ({ row }) => {
          const cfg = TYPE_BADGES[row.original.promotion_type] ?? {
            label: row.original.promotion_type,
            variant: "outline" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => {
          const cfg = STATUS_BADGES[row.original.status] ?? {
            label: row.original.status,
            variant: "secondary" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Priorité" />,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.priority}</span>
        ),
      },
      {
        id: "usage_count",
        accessorKey: "usage_count",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Utilisations" />,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.usage_count}</span>
        ),
      },
      {
        id: "total_discount",
        accessorKey: "total_discount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Remise Totale" />,
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {Number(row.original.total_discount).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            DZD
          </span>
        ),
      },
      {
        id: "is_stackable",
        accessorKey: "is_stackable",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Cumulable" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_stackable ? "default" : "secondary"}>
            {row.original.is_stackable ? "Oui" : "Non"}
          </Badge>
        ),
      },
      {
        id: "dates",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Validité" />,
        cell: ({ row }) => {
          const start = row.original.starts_at;
          const end = row.original.ends_at;
          if (!start && !end) return <span className="text-muted-foreground text-xs">Illimitée</span>;
          return (
            <span className="text-xs">
              {start ? formatDate(start, { month: "short" }) : "∞"} →{" "}
              {end ? formatDate(end, { month: "short" }) : "∞"}
            </span>
          );
        },
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Créé le" />,
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
              <DropdownMenuItem asChild>
                <Link href={`/console/promotions/${row.original.id}`}>
                  <Pencil className="mr-2 size-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              {row.original.status !== "active" && (
                <DropdownMenuItem>
                  <Play className="mr-2 size-4 text-emerald-600" />
                  Activer
                </DropdownMenuItem>
              )}
              {row.original.status === "active" && (
                <DropdownMenuItem>
                  <Square className="mr-2 size-4 text-amber-600" />
                  Mettre en pause
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const items = (data?.items ?? []) as PromotionRow[];
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "pmPage", perPage: "pmPerPage", sort: "pmSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  if (isLoading && !data)
    return <DataTableSkeleton columnCount={10} rowCount={10} filterCount={2} />;

  return (
    <>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder="Rechercher par nom ou slug…"
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title="Type"
            options={TYPE_OPTIONS}
            value={promotion_type ?? undefined}
            onChange={(val) => {
              setPromotionType(val);
              setPage(1);
            }}
          />
          <FacetedFilter
            title="Statut"
            options={STATUS_OPTIONS}
            value={status ?? undefined}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {table.getFilteredSelectedRowModel().rows.length} sélectionné(s)
            </Badge>
            <Button variant="secondary" size="sm">
              <Play className="mr-1 h-4 w-4" />
              Activer
            </Button>
            <Button variant="secondary" size="sm">
              <Square className="mr-1 h-4 w-4" />
              Mettre en pause
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-1 h-4 w-4" />
              Supprimer
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/promotions/export?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                  ...(promotion_type ? { promotion_type } : {}),
                })}`}
                download="promotions.csv"
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
