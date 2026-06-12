"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Check, Clipboard, Search } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { estimate_page_count } from "@/lib/console-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SkuOption = {
  property_code: string;
  value_code: string;
  value_label: string;
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

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actif uniquement" },
  { value: "inactive", label: "Inactif uniquement" },
];

export function VariantsTable() {
  const [page, setPage] = useQueryState("varPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("varPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("varStatus", parseAsString.withDefault("all"));
  const [search, setSearch] = useQueryState("varSearch", parseAsString.withDefault(""));

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string) => {
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const columns = React.useMemo<ColumnDef<SkuRow>[]>(
    () => [
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
              <p className="text-muted-foreground font-mono text-[10px]">Code-barres: {row.original.barcode}</p>
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
                <Badge key={`${opt.property_code}-${opt.value_code}`} variant="outline" className="text-[10px]">
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
            <span className={stock < 10 ? "text-warning font-bold font-mono" : "font-mono font-semibold"}>
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
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/console/products/${row.original.product_id}?tab=variants`}>
                Gérer
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [copiedId],
  );

  const { data, isLoading } = trpc.variants.adminList.useQuery({
    page,
    limit: per_page,
    status: status === "all" ? undefined : status,
    search: search || undefined,
  });

  const items = (data?.items ?? []) as SkuRow[];
  const totalRecords = data?.meta.total_records ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: estimate_page_count(page, per_page, totalRecords),
    queryKeys: { page: "varPage", perPage: "varPerPage" },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Rechercher par SKU, produit, code-barres..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} />
          ) : (
            <DataTable table={table} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
