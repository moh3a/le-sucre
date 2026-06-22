"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Calendar, Download, ExternalLink, MoreHorizontal, XCircle } from "lucide-react";
import Link from "next/link";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";

type PreorderRow = {
  id: string;
  sku_id: string;
  sku_code: string | null;
  product_name: string | null;
  warehouse_id: string;
  order_id: string | null;
  cart_id: string | null;
  order_item_id: string | null;
  quantity: number;
  status: string;
  estimated_available_at: string | null;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
};

interface Option {
  label: string;
  value: string;
}

const STATUS_OPTIONS: Option[] = [
  { label: "En Attente", value: "pending" },
  { label: "Confirmé", value: "confirmed" },
  { label: "Fini", value: "fulfilled" },
  { label: "Annulé", value: "cancelled" },
];

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En Attente", variant: "outline" },
  confirmed: { label: "Confirmé", variant: "secondary" },
  fulfilled: { label: "Fini", variant: "default" },
  cancelled: { label: "Annulé", variant: "destructive" },
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

export function PreordersTable() {
  const [page, setPage] = useQueryState("poPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("poPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("poSearch", parseAsString);
  const [status, setStatus] = useQueryState("poStatus", parseAsString);

  const [etaDialog, setEtaDialog] = React.useState<{
    allocation_id: string;
    current_eta: string | null;
  } | null>(null);
  const [etaDate, setEtaDate] = React.useState("");

  const utils = trpc.useUtils();
  const updateEtaMutation = trpc.preorders.updateEstimatedDate.useMutation({
    onSuccess: () => {
      utils.preorders.adminListAllocations.invalidate();
      setEtaDialog(null);
    },
  });

  const { data, isLoading } = trpc.preorders.adminListAllocations.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    search: search || undefined,
  });

  const columns = React.useMemo<ColumnDef<PreorderRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="ID Allocation" />,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      {
        id: "product",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Produit" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.product_name ?? "—"}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {row.original.sku_code ?? row.original.sku_id}
            </span>
          </div>
        ),
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Commande" />,
        cell: ({ row }) => {
          const oid = row.original.order_id;
          if (!oid) return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <Link
              href={`/console/orders/${oid}`}
              className="flex items-center gap-1 text-xs font-medium hover:underline"
            >
              {oid.slice(0, 12)}…
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
          );
        },
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Qté" />,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.quantity}</span>
        ),
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
        id: "estimated_available_at",
        accessorKey: "estimated_available_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="ETA" />
        ),
        cell: ({ row }) => {
          const eta = row.original.estimated_available_at;
          const canEdit = row.original.status !== "fulfilled" && row.original.status !== "cancelled";
          return (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {eta
                  ? formatDate(eta, { month: "short" })
                  : "—"}
              </span>
              {canEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    setEtaDialog({
                      allocation_id: row.original.id,
                      current_eta: row.original.estimated_available_at,
                    });
                    setEtaDate(
                      row.original.estimated_available_at
                        ? format(new Date(row.original.estimated_available_at), "yyyy-MM-dd")
                        : "",
                    );
                  }}
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              )}
            </div>
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
              {row.original.order_id && (
                <DropdownMenuItem asChild>
                  <Link href={`/console/orders/${row.original.order_id}`}>
                    <ExternalLink className="mr-2 size-4" />
                    Voir la commande
                  </Link>
                </DropdownMenuItem>
              )}
              {row.original.status !== "fulfilled" && row.original.status !== "cancelled" && (
                <DropdownMenuItem
                  onClick={() => {
                    setEtaDialog({
                      allocation_id: row.original.id,
                      current_eta: row.original.estimated_available_at,
                    });
                    setEtaDate(
                      row.original.estimated_available_at
                        ? format(new Date(row.original.estimated_available_at), "yyyy-MM-dd")
                        : "",
                    );
                  }}
                >
                  <Calendar className="mr-2 size-4" />
                  Modifier l&apos;ETA
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const items = (data?.items ?? []) as PreorderRow[];
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "poPage", perPage: "poPerPage", sort: "poSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  function handleUpdateEta() {
    if (!etaDialog || !etaDate) return;
    const date = new Date(etaDate);
    if (isNaN(date.getTime())) return;
    updateEtaMutation.mutate({
      allocation_id: etaDialog.allocation_id,
      estimated_available_at: format(date, "yyyy-MM-dd HH:mm:ss"),
    });
  }

  return (
    <QueryGuard query={{ isLoading }} mutation={updateEtaMutation} loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={2} />}>
    <>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder="Rechercher par ID, SKU ou produit…"
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
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
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/preorders/export?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                })}`}
                download="preorders.csv"
              >
                <Download className="mr-1 h-4 w-4" />
                Exporter
              </a>
            </Button>
          </div>
        )}
      </DataTable>

      <Dialog
        open={!!etaDialog}
        onOpenChange={(open) => {
          if (!open) setEtaDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la date de disponibilité</DialogTitle>
            <DialogDescription>
              Mettez à jour la date estimée de disponibilité pour cette allocation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="eta-date">Date de disponibilité</Label>
            <Input
              id="eta-date"
              type="date"
              value={etaDate}
              onChange={(e) => setEtaDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEtaDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateEta} disabled={!etaDate || updateEtaMutation.isPending}>
              {updateEtaMutation.isPending ? "Mise à jour…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
    </QueryGuard>
  );
}
