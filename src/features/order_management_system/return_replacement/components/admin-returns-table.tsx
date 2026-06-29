"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { ArrowLeftRight, Ban, Check, CheckCircle2, Download, MoreHorizontal, PackageX, RotateCcw, Truck, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  RETURN_REQUEST_STATUS_BADGE,
} from "../constants/status";
import type { ReturnRequestRow } from "./types";

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

function ReviewDialog({
  request,
  open,
  onOpenChange,
}: {
  request: ReturnRequestRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("return_requests");
  const utils = trpc.useUtils();
  const [note, setNote] = React.useState("");
  const [refund, setRefund] = React.useState("");

  const reviewMutation = trpc.returns.adminReview.useMutation({
    onSuccess: () => {
      toast.success(t("review_updated"));
      utils.returns.adminList.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  if (!request) return null;

  const typeLabel = request.type === "return" ? t("type_return")
    : request.type === "replacement" ? t("type_replacement")
    : t("type_failed_delivery");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("review_dialog_title")}</DialogTitle>
          <DialogDescription>
            {typeLabel} — {request.id.slice(0, 12)}…
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {request.reason && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs font-medium">{t("reason_label")}:</span>
              <p className="mt-0.5">{request.reason}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("admin_note_label")}</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("admin_note_placeholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("refund_amount_label")}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={refund}
              onChange={(e) => setRefund(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="default"
            disabled={reviewMutation.isPending}
            onClick={() =>
              reviewMutation.mutate({
                id: request.id,
                status: "approved",
                admin_note: note || undefined,
                refund_amount: refund ? Number(refund) : undefined,
              })
            }
          >
            <Check className="mr-2 size-4" />
            {t("approve_action")}
          </Button>
          <Button
            variant="destructive"
            disabled={reviewMutation.isPending}
            onClick={() =>
              reviewMutation.mutate({
                id: request.id,
                status: "rejected",
                admin_note: note || undefined,
              })
            }
          >
            <X className="mr-2 size-4" />
            {t("reject_action")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminReturnsTable() {
  const t = useTranslations("return_requests");
  const [page] = useQueryState("rrPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("rrPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("rrStatus", parseAsString);
  const [type, setType] = useQueryState("rrType", parseAsString);
  const [reviewTarget, setReviewTarget] = React.useState<ReturnRequestRow | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const STATUS_LABELS: Record<string, string> = {
    pending: t("status_pending"),
    approved: t("status_approved"),
    rejected: t("status_rejected"),
    in_transit: t("status_in_transit"),
    received: t("status_received"),
    completed: t("status_completed"),
    cancelled: t("status_cancelled"),
  };

  const TYPE_LABELS: Record<string, string> = {
    return: t("type_return"),
    replacement: t("type_replacement"),
    failed_delivery: t("type_failed_delivery"),
  };

  const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  const utils = trpc.useUtils();

  const reviewMutation = trpc.returns.adminReview.useMutation({
    onSuccess: () => {
      toast.success(t("review_updated"));
      utils.returns.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const receiveMutation = trpc.returns.adminReceive.useMutation({
    onSuccess: () => {
      toast.success(t("received_recorded"));
      utils.returns.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = trpc.returns.adminComplete.useMutation({
    onSuccess: () => {
      toast.success(t("request_completed"));
      utils.returns.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.returns.adminCancel.useMutation({
    onSuccess: () => {
      toast.success(t("request_cancelled"));
      utils.returns.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<ReturnRequestRow>[]>(
    () => [
      {
        id: "type",
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("type_column")} />,
        cell: ({ row }) => {
          const type = row.original.type;
          const icon = type === "return" ? <RotateCcw className="size-4" />
            : type === "replacement" ? <ArrowLeftRight className="size-4" />
            : <PackageX className="size-4" />;
          return (
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-sm">{TYPE_LABELS[type] ?? type}</span>
            </div>
          );
        },
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("order_column")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/orders/${row.original.order_id}`}
            className="font-mono text-xs underline underline-offset-2 hover:text-primary"
          >
            {row.original.order_id.slice(0, 12)}…
          </Link>
        ),
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("reason_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.reason ?? "—"}
          </span>
        ),
      },
      {
        id: "items",
        accessorKey: "items",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("items_column")} />,
        cell: ({ row }) => {
          const items = row.original.items;
          return (
            <span className="text-sm">
              {items?.reduce((s, i) => s + i.quantity, 0) ?? 0}
            </span>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_title")} />,
        cell: ({ row }) => (
          <Badge variant={RETURN_REQUEST_STATUS_BADGE[row.original.status] ?? "outline"}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "refund_amount",
        accessorKey: "refund_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("refund_column")} />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.refund_amount
              ? `${Number(row.original.refund_amount).toLocaleString("fr-FR")} DZD`
              : "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date_column")} />,
        cell: ({ row }) =>
          formatDate(row.original.created_at, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
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
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                {r.status === "pending" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setReviewTarget(r);
                        setReviewOpen(true);
                      }}
                    >
                      <CheckCircle2 className="mr-2 size-4 text-green-600" />
                      {t("review_action")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        cancelMutation.mutate({ id: r.id, reason: t("cancelled_manually") })
                      }
                    >
                      <Ban className="mr-2 size-4 text-red-600" />
                      {t("cancel_action")}
                    </DropdownMenuItem>
                  </>
                )}
                {r.status === "approved" && r.type !== "replacement" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => receiveMutation.mutate({ id: r.id })}
                    >
                      <Truck className="mr-2 size-4 text-blue-600" />
                      {t("mark_received")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        cancelMutation.mutate({ id: r.id, reason: t("cancelled_manually") })
                      }
                    >
                      <Ban className="mr-2 size-4 text-red-600" />
                      {t("cancel_action")}
                    </DropdownMenuItem>
                  </>
                )}
                {r.status === "received" && (
                  <DropdownMenuItem
                    onClick={() => completeMutation.mutate({ id: r.id })}
                  >
                    <Check className="mr-2 size-4 text-green-600" />
                    {t("complete_action")}
                  </DropdownMenuItem>
                )}
                {(r.status === "rejected" || r.status === "completed" || r.status === "cancelled") && (
                  <DropdownMenuItem disabled>
                    {t("already_label")} {STATUS_LABELS[r.status]?.toLowerCase()}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [reviewMutation, receiveMutation, completeMutation, cancelMutation, t],
  );

  const { data, isLoading } = trpc.returns.adminList.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    type: type || undefined,
  });

  const items = (data?.items ?? []) as unknown as ReturnRequestRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "rrPage", perPage: "rrPerPage", sort: "rrSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={2} />}>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <FacetedFilter
            title={t("status_title")}
            options={STATUS_OPTIONS}
            value={status ?? undefined}
            onChange={(val) => setStatus(val)}
          />
          <FacetedFilter
            title={t("type_title")}
            options={TYPE_OPTIONS}
            value={type ?? undefined}
            onChange={(val) => setType(val)}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {t("selected_count", { count: table.getFilteredSelectedRowModel().rows.length })}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/returns/export?${new URLSearchParams({
                  ...(status ? { status } : {}),
                  ...(type ? { type } : {}),
                })}`}
                download="returns.csv"
              >
                <Download className="mr-1 h-4 w-4" />
                {t("export")}
              </a>
            </Button>
          </div>
        )}
      </DataTable>
      <ReviewDialog request={reviewTarget} open={reviewOpen} onOpenChange={setReviewOpen} />
    </QueryGuard>
  );
}
