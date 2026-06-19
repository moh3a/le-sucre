"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { CheckCircle2, Download, MoreHorizontal, XCircle } from "lucide-react";
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
  verified: "Vérifié",
  rejected: "Rejeté",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  verified: "default",
  rejected: "destructive",
};

const STATUS_OPTIONS = [
  { label: "En attente", value: "pending" },
  { label: "Vérifié", value: "verified" },
  { label: "Rejeté", value: "rejected" },
];

type VerificationRow = {
  id: string;
  order_id: string;
  verification_type: string;
  status: string;
  amount: string;
  currency: string;
  reference_number: string | null;
  proof_url: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_by_user_id: string;
  verified_by_user_id: string | null;
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

export function PaymentVerificationsTable() {
  const [page] = useQueryState("pvPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("pvPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("pvStatus", parseAsString);

  const utils = trpc.useUtils();

  const verifyMutation = trpc.operations.paymentVerify.useMutation({
    onSuccess: () => {
      toast.success("Vérification mise à jour");
      utils.operations.paymentListVerifications.invalidate();
      utils.operations.paymentCountPendingVerifications.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<VerificationRow>[]>(
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
        id: "amount",
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Montant" />,
        cell: ({ row }) => (
          <span className="font-mono font-medium">
            {Number(row.original.amount).toLocaleString("fr-DZ", {
              style: "currency",
              currency: row.original.currency,
            })}
          </span>
        ),
      },
      {
        id: "reference_number",
        accessorKey: "reference_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Référence" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.reference_number ?? "—"}</span>
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
        id: "notes",
        accessorKey: "notes",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Notes" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.notes ?? "—"}
          </span>
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
              <DropdownMenuItem asChild>
                <Link href={`/console/orders/${row.original.order_id}`}>
                  Voir commande
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      verifyMutation.mutate({ id: row.original.id, status: "verified" })
                    }
                  >
                    <CheckCircle2 className="mr-2 size-4 text-green-600" />
                    Vérifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      verifyMutation.mutate({ id: row.original.id, status: "rejected" })
                    }
                  >
                    <XCircle className="mr-2 size-4 text-red-600" />
                    Rejeter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [verifyMutation],
  );

  const { data, isLoading } = trpc.operations.paymentListVerifications.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as VerificationRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "pvPage", perPage: "pvPerPage", sort: "pvSort" },
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
              href={`/api/admin/payment-verifications/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="payment-verifications.csv"
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
