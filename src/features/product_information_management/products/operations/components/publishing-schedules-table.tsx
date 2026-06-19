"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Ban, Download, MoreHorizontal, XCircle } from "lucide-react";

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
  pending: "Planifiée",
  executed: "Exécutée",
  failed: "Échouée",
  cancelled: "Annulée",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  executed: "default",
  failed: "destructive",
  cancelled: "outline",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const ACTION_LABELS: Record<string, string> = {
  publish: "Publication",
  unpublish: "Dépublication",
};

type ScheduleRow = {
  id: string;
  product_id: string;
  action: string;
  scheduled_at: string;
  status: string;
  executed_at: string | null;
  cancelled_by_user_id: string | null;
  cancel_reason: string | null;
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

export function PublishingSchedulesTable() {
  const [page] = useQueryState("psPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("psPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("psStatus", parseAsString);

  const utils = trpc.useUtils();

  const cancelMutation = trpc.operations.productCancelSchedule.useMutation({
    onSuccess: () => {
      toast.success("Planification annulée");
      utils.operations.productListScheduledActions.invalidate();
      utils.operations.productGetScheduleStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<ScheduleRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "product_id",
        accessorKey: "product_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Produit" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.product_id.slice(0, 12)}…</span>
        ),
      },
      {
        id: "action",
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Action" />,
        cell: ({ row }) => (
          <Badge variant={row.original.action === "publish" ? "default" : "secondary"}>
            {ACTION_LABELS[row.original.action] ?? row.original.action}
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Programmée" />,
        cell: ({ row }) => formatDate(row.original.scheduled_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: "executed_at",
        accessorKey: "executed_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Exécutée" />,
        cell: ({ row }) =>
          row.original.executed_at
            ? formatDate(row.original.executed_at, { month: "short", day: "numeric", hour: "2-digit" })
            : <span className="text-muted-foreground">—</span>,
      },
      {
        id: "cancel_reason",
        accessorKey: "cancel_reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Motif annulation" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[160px] truncate text-xs">
            {row.original.cancel_reason ?? "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Créée" />,
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
                {r.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() =>
                      cancelMutation.mutate({
                        schedule_id: r.id,
                        reason: "Annulé par opérateur",
                      })
                    }
                  >
                    <Ban className="mr-2 size-4 text-red-600" />
                    Annuler
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [cancelMutation],
  );

  const { data, isLoading } = trpc.operations.productListScheduledActions.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as ScheduleRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "psPage", perPage: "psPerPage", sort: "psSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  if (isLoading && !data)
    return <DataTableSkeleton columnCount={9} rowCount={10} filterCount={1} />;

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
              href={`/api/admin/publishing-schedules/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="publishing-schedules.csv"
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
