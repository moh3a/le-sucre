"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import {
  CheckCircle2,
  Download,
  Hammer,
  MoreHorizontal,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  under_review: "En révision",
  approved: "Approuvé",
  rejected: "Rejeté",
  in_repair: "En réparation",
  repaired: "Réparé",
  replaced: "Remplacé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  under_review: "secondary",
  approved: "default",
  rejected: "destructive",
  in_repair: "secondary",
  repaired: "default",
  replaced: "default",
  completed: "default",
  cancelled: "destructive",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const ISSUE_LABELS: Record<string, string> = {
  defect: "Défaut de fabrication",
  damage: "Dommage",
  malfunction: "Dysfonctionnement",
  cosmetic: "Défaut esthétique",
  other: "Autre",
};

type WarrantyRow = {
  id: string;
  order_id: string;
  order_item_id: string | null;
  product_id: string;
  sku_id: string;
  user_id: string | null;
  status: string;
  issue_type: string;
  description: string;
  technician_user_id: string | null;
  technician_notes: string | null;
  resolution_type: string | null;
  resolution_notes: string | null;
  resolution_date: string | null;
  reviewed_by_user_id: string | null;
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

export function WarrantyTable() {
  const [page] = useQueryState("wrPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("wrPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("wrStatus", parseAsString);

  const utils = trpc.useUtils();

  const reviewMutation = trpc.operations.warrantyReview.useMutation({
    onSuccess: () => {
      toast.success("Demande mise à jour");
      utils.operations.warrantyList.invalidate();
      utils.operations.warrantyStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resolveMutation = trpc.operations.warrantyResolve.useMutation({
    onSuccess: () => {
      toast.success("Résolution enregistrée");
      utils.operations.warrantyList.invalidate();
      utils.operations.warrantyStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<WarrantyRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Commande" />,
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
        id: "issue_type",
        accessorKey: "issue_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Problème" />,
        cell: ({ row }) => (
          <span className="text-sm">{ISSUE_LABELS[row.original.issue_type] ?? row.original.issue_type}</span>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Description" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "resolution_type",
        accessorKey: "resolution_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Résolution" />,
        cell: ({ row }) => (
          <span className="capitalize text-sm">{row.original.resolution_type ?? "—"}</span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => (
          <Badge variant={STATUS_STYLES[row.original.status] ?? "outline"}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/console/orders/${r.order_id}`}>Voir commande</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {r.status === "pending" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "under_review" })}
                    >
                      <RotateCcw className="mr-2 size-4" />
                      Mettre en révision
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "approved" })}
                    >
                      <CheckCircle2 className="mr-2 size-4 text-green-600" />
                      Approuver
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "rejected" })}
                    >
                      <XCircle className="mr-2 size-4 text-red-600" />
                      Rejeter
                    </DropdownMenuItem>
                  </>
                )}
                {r.status === "approved" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => resolveMutation.mutate({ id: r.id, resolution_type: "repair" })}
                    >
                      <Hammer className="mr-2 size-4" />
                      Réparation
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => resolveMutation.mutate({ id: r.id, resolution_type: "replace" })}
                    >
                      <RotateCcw className="mr-2 size-4" />
                      Remplacement
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => resolveMutation.mutate({ id: r.id, resolution_type: "refund" })}
                    >
                      <RotateCcw className="mr-2 size-4" />
                      Remboursement
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [reviewMutation, resolveMutation],
  );

  const { data, isLoading } = trpc.operations.warrantyList.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as WarrantyRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "wrPage", perPage: "wrPerPage", sort: "wrSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />}>
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title="Statut"
          options={STATUS_OPTIONS}
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
              href={`/api/admin/warranty/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="warranty.csv"
            >
              <Download className="mr-1 h-4 w-4" />
              Exporter
            </a>
          </Button>
        </div>
      )}
    </DataTable>
    </QueryGuard>
  );
}
