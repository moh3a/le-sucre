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
  approved: "Approuvé",
  rejected: "Rejeté",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const REVIEW_TYPE_LABELS: Record<string, string> = {
  approval: "Approbation",
  modification: "Modification",
  activation: "Activation",
};

type PromotionReviewRow = {
  id: string;
  promotion_id: string;
  review_type: string;
  status: string;
  reviewer_user_id: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  requested_by_user_id: string;
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

export function PromotionReviewsTable() {
  const [page] = useQueryState("prPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("prPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("prStatus", parseAsString);

  const utils = trpc.useUtils();

  const reviewMutation = trpc.operations.promotionReview.useMutation({
    onSuccess: () => {
      toast.success("Avis enregistré");
      utils.operations.promotionListReviews.invalidate();
      utils.operations.promotionGetReviewStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<PromotionReviewRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "promotion_id",
        accessorKey: "promotion_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Promotion" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.promotion_id.slice(0, 12)}…</span>
        ),
      },
      {
        id: "review_type",
        accessorKey: "review_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
        cell: ({ row }) => (
          <span className="text-sm">
            {REVIEW_TYPE_LABELS[row.original.review_type] ?? row.original.review_type}
          </span>
        ),
      },
      {
        id: "requested_by_user_id",
        accessorKey: "requested_by_user_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Demandé par" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.requested_by_user_id.slice(0, 10)}…</span>
        ),
      },
      {
        id: "reviewer_user_id",
        accessorKey: "reviewer_user_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Validé par" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.reviewer_user_id
              ? `${row.original.reviewer_user_id.slice(0, 10)}…`
              : "—"}
          </span>
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
        id: "review_note",
        accessorKey: "review_note",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Note" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[160px] truncate text-xs">
            {row.original.review_note ?? "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
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
                {r.status === "pending" ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "approved" })}
                    >
                      <CheckCircle2 className="mr-2 size-4 text-green-600" />
                      Approuver
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        reviewMutation.mutate({ id: r.id, status: "rejected" })
                      }
                    >
                      <XCircle className="mr-2 size-4 text-red-600" />
                      Rejeter
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>
                    Déjà {STATUS_LABELS[r.status]?.toLowerCase()}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [reviewMutation],
  );

  const { data, isLoading } = trpc.operations.promotionListReviews.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
  });

  const items = (data?.items ?? []) as unknown as PromotionReviewRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "prPage", perPage: "prPerPage", sort: "prSort" },
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
              href={`/api/admin/promotion-reviews/export?${new URLSearchParams({
                ...(status ? { status } : {}),
              })}`}
              download="promotion-reviews.csv"
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
