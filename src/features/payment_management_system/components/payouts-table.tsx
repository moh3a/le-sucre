"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Banknote, CheckCircle2, Download, MoreHorizontal, XCircle } from "lucide-react";

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

const STATUS_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "outline" },
  processing: { label: "En cours", variant: "secondary" },
  completed: { label: "Terminé", variant: "default" },
  failed: { label: "Échoué", variant: "destructive" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

const STATUS_OPTIONS = [
  { label: "En attente", value: "pending" },
  { label: "En cours", value: "processing" },
  { label: "Terminé", value: "completed" },
  { label: "Échoué", value: "failed" },
  { label: "Annulé", value: "cancelled" },
];

type PayoutRow = {
  id: string;
  vendor_id: string | null;
  currency: string;
  gross_amount: string;
  commission_amount: string;
  net_amount: string;
  status: string;
  payout_method: string | null;
  description: string | null;
  processed_at: string | null;
  completed_at: string | null;
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

export function PayoutsTable() {
  const [page] = useQueryState("poPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("poPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("poStatus", parseAsString);

  const utils = trpc.useUtils();

  const processMutation = trpc.payments.adminProcessPayout.useMutation({
    onSuccess: () => {
      toast.success("Paiement traité");
      utils.payments.adminListPayouts.invalidate();
      utils.payments.adminPayoutStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = trpc.payments.adminCompletePayout.useMutation({
    onSuccess: () => {
      toast.success("Paiement marqué comme payé");
      utils.payments.adminListPayouts.invalidate();
      utils.payments.adminPayoutStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<PayoutRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "vendor_id",
        accessorKey: "vendor_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Vendeur" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.vendor_id?.slice(0, 14) ?? "N/A"}</span>
        ),
      },
      {
        id: "gross_amount",
        accessorKey: "gross_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Brut" />,
        cell: ({ row }) => (
          <span className="font-mono font-medium">
            {Number(row.original.gross_amount).toLocaleString("fr-DZ", {
              style: "currency",
              currency: row.original.currency,
            })}
          </span>
        ),
      },
      {
        id: "commission_amount",
        accessorKey: "commission_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Commission" />,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-sm">
            {Number(row.original.commission_amount).toLocaleString("fr-DZ", {
              style: "currency",
              currency: row.original.currency,
            })}
          </span>
        ),
      },
      {
        id: "net_amount",
        accessorKey: "net_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Net" />,
        cell: ({ row }) => (
          <span className="font-mono font-medium text-green-600">
            {Number(row.original.net_amount).toLocaleString("fr-DZ", {
              style: "currency",
              currency: row.original.currency,
            })}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => {
          const cfg = STATUS_STYLES[row.original.status] ?? {
            label: row.original.status,
            variant: "outline" as const,
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "payout_method",
        accessorKey: "payout_method",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Méthode" />,
        cell: ({ row }) => (
          <span className="capitalize text-sm">{row.original.payout_method ?? "—"}</span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {row.original.status === "pending" && (
                <DropdownMenuItem
                  onClick={() => processMutation.mutate({ payout_id: row.original.id })}
                >
                  Traiter
                </DropdownMenuItem>
              )}
              {(row.original.status === "pending" || row.original.status === "processing") && (
                <DropdownMenuItem
                  onClick={() => completeMutation.mutate({ payout_id: row.original.id })}
                >
                  <CheckCircle2 className="mr-2 size-4 text-green-600" />
                  Marquer comme payé
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [processMutation, completeMutation],
  );

  const { data, isLoading } = trpc.payments.adminListPayouts.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as PayoutRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "poPage", perPage: "poPerPage", sort: "poSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  if (isLoading && !data)
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={1} />;

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title="Statut"
          options={STATUS_OPTIONS}
          icon={Banknote}
          value={status ?? undefined}
          onChange={(val) => setStatus(val)}
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
              href={`/api/admin/payouts/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="payouts.csv"
            >
              <Download className="mr-1 h-4 w-4" />
              Exporter
            </a>
          </Button>
        </div>
      )}
    </DataTable>
  );
}
