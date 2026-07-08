"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  ShieldAlert,
  Star,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { QueryGuard } from "@/components/query-guard";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";

type ReviewRow = {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  moderation_note: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  report_count: number;
  created_at: string;
  author_name: string | null;
  author_email: string | null;
  product_name: string | null;
};

interface Option {
  label: string;
  value: string;
}

const STATUS_OPTIONS = (t: (key: string) => string): Option[] => [
  { label: t("pending_badge"), value: "pending" },
  { label: t("approved_badge"), value: "approved" },
  { label: t("rejected_badge"), value: "rejected" },
];

const RATING_OPTIONS = (t: (key: string) => string): Option[] => [
  { label: t("stars_5"), value: "5" },
  { label: t("stars_4"), value: "4" },
  { label: t("stars_3"), value: "3" },
  { label: t("stars_2"), value: "2" },
  { label: t("stars_1"), value: "1" },
];

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
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
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

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "outline",
  rejected: "destructive",
  hidden: "default",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "pending_badge",
  approved: "approved_badge",
  rejected: "rejected_badge",
  hidden: "hidden_badge",
};

export function AdminReviewModerationTable() {
  const t = useTranslations("reviews");
  const [page, setPage] = useQueryState("revPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("revPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("revSearch", parseAsString);
  const [status, setStatus] = useQueryState("revStatus", parseAsString);
  const [rating, setRating] = useQueryState("revRating", parseAsString);

  const [moderateDialog, setModerateDialog] = React.useState<{
    review_id: string;
    action: "approved" | "rejected";
  } | null>(null);
  const [moderationNote, setModerationNote] = React.useState("");

  const utils = trpc.useUtils();

  const moderate = trpc.reviews.moderate.useMutation({
    onSuccess: () => {
      utils.reviews.adminList.invalidate();
      utils.reviews.adminStats.invalidate();
      setModerateDialog(null);
      setModerationNote("");
    },
  });

  const columns = React.useMemo<ColumnDef<ReviewRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "product_name",
        accessorKey: "product_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("product_column")} />
        ),
        cell: ({ row }) => (
          <Link
            href={`/console/products/${row.original.product_id}`}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            {row.original.product_name ?? "—"}
            <ExternalLink className="text-muted-foreground ml-0.5 h-3 w-3 shrink-0" />
          </Link>
        ),
      },
      {
        id: "author",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("author_column")} />
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium">{row.original.author_name ?? "—"}</p>
            {row.original.author_email && (
              <p className="text-muted-foreground truncate text-xs">{row.original.author_email}</p>
            )}
          </div>
        ),
      },
      {
        id: "rating",
        accessorKey: "rating",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("rating_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold">{row.original.rating}</span>
            <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
          </div>
        ),
      },
      {
        id: "content",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("review_column")} />
        ),
        cell: ({ row }) => (
          <div className="max-w-xs space-y-1">
            {row.original.title && (
              <p className="truncate text-sm font-medium">{row.original.title}</p>
            )}
            <p className="text-muted-foreground line-clamp-2 text-xs">{row.original.body}</p>
            {row.original.is_verified_purchase && (
              <Badge variant="outline" className="text-[10px] text-emerald-600">
                {t("verified_purchase")}
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status_column")} />
        ),
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANTS[row.original.status] ?? "default"}>
            {t(STATUS_LABELS[row.original.status] ?? row.original.status)}
          </Badge>
        ),
      },
      {
        id: "reports",
        accessorKey: "report_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("reports_column")} />
        ),
        cell: ({ row }) =>
          row.original.report_count > 0 ? (
            <Badge
              variant="destructive"
              className="flex w-fit items-center gap-1 px-2 py-0.5 text-[10px]"
            >
              <ShieldAlert className="size-3" />
              {row.original.report_count}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        id: "helpful",
        accessorKey: "helpful_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("helpful_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <MessageSquare className="text-muted-foreground size-3.5" />
            {row.original.helpful_count}
          </div>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date_column")} />,
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
                <Link href={`/console/products/${row.original.product_id}`}>
                  <ExternalLink className="mr-2 size-4" />
                  {t("view_product")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={row.original.status === "approved" || moderate.isPending}
                onClick={() => {
                  setModerateDialog({ review_id: row.original.id, action: "approved" });
                  setModerationNote("");
                }}
              >
                <Check className="mr-2 size-4 text-emerald-600" />
                {t("approve")}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={row.original.status === "rejected" || moderate.isPending}
                onClick={() => {
                  setModerateDialog({ review_id: row.original.id, action: "rejected" });
                  setModerationNote("");
                }}
              >
                <X className="mr-2 size-4 text-red-600" />
                {t("reject")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [moderate.isPending, t],
  );

  const { data: responseData, isLoading: isListLoading } = trpc.reviews.adminList.useQuery({
    page,
    limit: per_page,
    status: status ?? undefined,
  });

  const items = ((responseData?.items ?? []) as ReviewRow[]).filter((item) => {
    if (rating && item.rating !== Number(rating)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesProduct = item.product_name?.toLowerCase().includes(q);
      const matchesAuthor = item.author_name?.toLowerCase().includes(q);
      const matchesBody = item.body.toLowerCase().includes(q);
      const matchesTitle = item.title?.toLowerCase().includes(q);
      if (!matchesProduct && !matchesAuthor && !matchesBody && !matchesTitle) return false;
    }
    return true;
  });
  const page_count = responseData?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items as ReviewRow[],
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "revPage", perPage: "revPerPage", sort: "revSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  function runBulk(action: "approved" | "rejected") {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (!ids.length) return;
    ids.forEach((review_id) => {
      moderate.mutate({ review_id, status: action });
    });
  }

  function handleModerate() {
    if (!moderateDialog) return;
    moderate.mutate({
      review_id: moderateDialog.review_id,
      status: moderateDialog.action,
      moderation_note: moderationNote || undefined,
    });
  }

  return (
    <QueryGuard
      query={{ isLoading: isListLoading }}
      loadingFallback={<DataTableSkeleton columnCount={9} rowCount={10} filterCount={2} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_reviews_placeholder")}
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title={t("status_title")}
            options={STATUS_OPTIONS(t)}
            icon={XCircle}
            value={status ?? undefined}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          />
          <FacetedFilter
            title={t("rating_title")}
            options={RATING_OPTIONS(t)}
            icon={Star}
            value={rating ?? undefined}
            onChange={(val) => {
              setRating(val);
              setPage(1);
            }}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {table.getFilteredSelectedRowModel().rows.length} {t("selected")}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => runBulk("approved")}
              disabled={moderate.isPending}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {t("approve")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => runBulk("rejected")}
              disabled={moderate.isPending}
            >
              <XCircle className="mr-1 h-4 w-4" />
              {t("reject")}
            </Button>
          </div>
        )}
      </DataTable>

      <Dialog
        open={!!moderateDialog}
        onOpenChange={(open) => {
          if (!open) setModerateDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderateDialog?.action === "approved" ? t("approve_review") : t("reject_review")}
            </DialogTitle>
            <DialogDescription>
              {moderateDialog?.action === "approved"
                ? t("approve_description")
                : t("reject_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="moderation-note">{t("moderation_note")}</Label>
            <Textarea
              id="moderation-note"
              placeholder={t("moderation_note_placeholder")}
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModerateDialog(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant={moderateDialog?.action === "approved" ? "default" : "destructive"}
              onClick={handleModerate}
              disabled={moderate.isPending}
            >
              {moderate.isPending
                ? t("moderating")
                : moderateDialog?.action === "approved"
                  ? t("approve")
                  : t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
