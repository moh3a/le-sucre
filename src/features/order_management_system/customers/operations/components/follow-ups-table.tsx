"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { CheckCircle2, Download, MoreHorizontal, XCircle } from "lucide-react";
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
  completed: "Terminé",
  cancelled: "Annulé",
  rescheduled: "Reporté",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  completed: "default",
  cancelled: "destructive",
  rescheduled: "secondary",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const FU_TYPE_LABELS: Record<string, string> = {
  callback: "Rappel",
  follow_up: "Suivi",
  reminder: "Rappel automatique",
};

const PRIORITY_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  normal: "secondary",
  high: "default",
  urgent: "destructive",
};

type FollowUpRow = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  follow_up_type: string;
  title: string;
  description: string | null;
  assigned_to_user_id: string | null;
  status: string;
  priority: string;
  scheduled_at: string;
  completed_at: string | null;
  completed_by_user_id: string | null;
  result_notes: string | null;
  created_by_user_id: string;
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

export function FollowUpsTable() {
  const [page] = useQueryState("fuPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("fuPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("fuStatus", parseAsString);

  const utils = trpc.useUtils();

  const completeMutation = trpc.operations.customerCompleteFollowUp.useMutation({
    onSuccess: () => {
      toast.success("Relance terminée");
      utils.operations.customerListMyFollowUps.invalidate();
      utils.operations.customerGetOverdueFollowUps.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.operations.customerCancelFollowUp.useMutation({
    onSuccess: () => {
      toast.success("Relance annulée");
      utils.operations.customerListMyFollowUps.invalidate();
      utils.operations.customerGetOverdueFollowUps.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<FollowUpRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Titre" />,
        cell: ({ row }) => (
          <span className="max-w-[220px] truncate font-medium text-sm">{row.original.title}</span>
        ),
      },
      {
        id: "follow_up_type",
        accessorKey: "follow_up_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
        cell: ({ row }) => (
          <span className="text-sm">{FU_TYPE_LABELS[row.original.follow_up_type] ?? row.original.follow_up_type}</span>
        ),
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Commande" />,
        cell: ({ row }) =>
          row.original.order_id ? (
            <Link href={`/console/orders/${row.original.order_id}`} className="font-mono text-xs hover:underline">
              {row.original.order_id.slice(0, 12)}…
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Priorité" />,
        cell: ({ row }) => (
          <Badge variant={PRIORITY_STYLES[row.original.priority] ?? "outline"} className="uppercase text-[10px]">
            {row.original.priority}
          </Badge>
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
        id: "scheduled_at",
        accessorKey: "scheduled_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Programmé" />,
        cell: ({ row }) => formatDate(row.original.scheduled_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Créé" />,
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
                {r.order_id && (
                  <DropdownMenuItem asChild>
                    <Link href={`/console/orders/${r.order_id}`}>Voir commande</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {r.status === "pending" && (
                  <>
                    <DropdownMenuItem onClick={() => completeMutation.mutate({ id: r.id })}>
                      <CheckCircle2 className="mr-2 size-4 text-green-600" />
                      Terminer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cancelMutation.mutate({ id: r.id })}>
                      <XCircle className="mr-2 size-4 text-red-600" />
                      Annuler
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [completeMutation, cancelMutation],
  );

  const { data, isLoading } = trpc.operations.customerListMyFollowUps.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const overdue = trpc.operations.customerGetOverdueFollowUps.useQuery();

  const items = (data?.items ?? []) as unknown as FollowUpRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "fuPage", perPage: "fuPerPage", sort: "fuSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={1} />}>
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
              href={`/api/admin/follow-ups/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="follow-ups.csv"
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
