"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsFloat, parseAsString, useQueryState } from "nuqs";
import {
  Archive,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Folder,
  Loader2,
  MoreHorizontal,
  Pencil,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { XCircle } from "lucide-react";
import { formatDate } from "@/lib/format";
import { ProductStatusBadge } from "./product-status-badge";

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  status: "draft" | "published" | "archived" | undefined;
  base_price: string;
  created_at: string;
  name: string | null;
  category_name: string | null;
  brand_name: string | null;
  image_url: string | null;
  sku_count: number;
  current_stock: number;
  units_sold: number;
  revenue: string;
  review_count: number;
  average_rating: string;
  is_featured: boolean;
};

interface Option {
  label: string;
  value: string;
}

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
  const common = useTranslations("common");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {value ? (
            <div
              role="button"
              aria-label={common("clear_filter", { title })}
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

function RangeFilter({
  title,
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
}: {
  title: string;
  min: number;
  max: number;
  minValue?: number | null;
  maxValue?: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  unit?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const common = useTranslations("common");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {minValue != null || maxValue != null ? (
            <div
              role="button"
              aria-label={common("clear_filter", { title })}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onMinChange(null);
                onMaxChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            <div className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {minValue != null || maxValue != null ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <span className="ml-1">
                {minValue != null ? minValue : "-"} - {maxValue != null ? maxValue : "-"}
                {unit ? ` ${unit}` : ""}
              </span>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Label htmlFor={`${title}-min`} className="sr-only">
                {common("min")}
              </Label>
              <Input
                id={`${title}-min`}
                type="number"
                placeholder={min.toString()}
                min={min}
                max={max}
                value={minValue ?? ""}
                onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : null)}
                className={unit ? "pr-8" : ""}
              />
              {unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {unit}
                </span>
              )}
            </div>
            <div className="relative flex-1">
              <Label htmlFor={`${title}-max`} className="sr-only">
                {common("max")}
              </Label>
              <Input
                id={`${title}-max`}
                type="number"
                placeholder={max.toString()}
                min={min}
                max={max}
                value={maxValue ?? ""}
                onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : null)}
                className={unit ? "pr-8" : ""}
              />
              {unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
          <Slider
            min={min}
            max={max}
            step={1}
            value={[minValue ?? min, maxValue ?? max]}
            onValueChange={([newMin, newMax]) => {
              onMinChange(newMin);
              onMaxChange(newMax);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProductRowActions({ row }: { row: ProductRow }) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const utils = trpc.useUtils();

  const delete_mutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.adminList.invalidate();
      setDeleteOpen(false);
      toast.success(t("delete_confirm_title"));
    },
    onError: (err) => toast.error(err.message),
  });
  const duplicate_mutation = trpc.products.duplicate.useMutation({
    onSuccess: () => {
      utils.products.adminList.invalidate();
      toast.success(t("duplicate_success"));
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/console/products/${row.id}`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/console/products/${row.id}?tab=recommendations`}>
              <Star className="mr-2 size-4" />
              {t("recommendations")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={duplicate_mutation.isPending}
            onClick={() => {
              duplicate_mutation.mutate({ id: row.id });
            }}
          >
            <Copy className="mr-2 size-4" />
            {t("duplicate")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            disabled={delete_mutation.isPending}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("delete_confirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delete_mutation.isPending}>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={delete_mutation.isPending}
              onClick={() => delete_mutation.mutate({ id: row.id })}
            >
              {delete_mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {delete_mutation.isPending ? tc("loading") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ProductDataTable() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const [assignCategoryOpen, setAssignCategoryOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const utils = trpc.useUtils();

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "Image",
        accessorKey: "image_url",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("image_column")} />,
        cell: ({ row }) =>
          row.original.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.image_url}
              alt={row.original.name ?? ""}
              className="h-20 w-20 object-cover object-center"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center bg-neutral-200 text-neutral-400">
              <FileText className="h-8 w-8" />
            </div>
          ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("name")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/products/${row.original.id}`}
            className="text-primary hover:underline font-medium"
          >
            {row.original.name ?? "—"}
          </Link>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status")} />,
        cell: ({ row }) => <ProductStatusBadge status={row.original.status ?? "draft"} />,
      },
      {
        id: "featured",
        accessorKey: "is_featured",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("featured_column")} />,
        cell: ({ row }) =>
          row.original.is_featured ? (
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
          ) : null,
      },
      {
        id: "base_price",
        accessorKey: "base_price",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("base_price")} />,
        cell: ({ row }) => `${Number(row.original.base_price).toFixed(2)} DZD`,
      },
      {
        id: "Category",
        accessorKey: "category_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("category_column")} />,
      },
      {
        id: "Brand",
        accessorKey: "brand_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("brand_column")} />,
      },
      {
        id: "stock",
        accessorKey: "current_stock",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("stock_column")} />,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.current_stock === 0
                ? "destructive"
                : row.original.current_stock <= 5
                  ? "outline"
                  : "default"
            }
          >
            {row.original.current_stock}
          </Badge>
        ),
      },
      {
        id: "Units sold",
        accessorKey: "units_sold",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("sales_column")} />,
      },
      {
        id: "Revenue",
        accessorKey: "revenue",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("revenue_column")} />,
        cell: ({ row }) => `${Number(row.original.revenue).toFixed(2)} DZD`,
      },
      {
        id: "Rating",
        accessorKey: "average_rating",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("rating_column")} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span>{row.original.average_rating}</span>
            <Badge variant="secondary">{row.original.review_count}</Badge>
          </div>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("created_at_column")} />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <ProductRowActions row={row.original} />
        ),
      },
    ],
    [t],
  );

  const [page] = useQueryState("prodPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("prodPerPage", parseAsInteger.withDefault(10));
  const [search, setSearchQuery] = useQueryState("name", parseAsString);
  const [status_filter] = useQueryState("status", parseAsArrayOf(parseAsString, ","));
  const [brand_id, setBrandId] = useQueryState("brand_id", parseAsString);
  const [category_id, setCategoryId] = useQueryState("category_id", parseAsString);
  const [stock_status, setStockStatus] = useQueryState("stock_status", parseAsString);
  const [price_min, setPriceMin] = useQueryState("price_min", parseAsFloat);
  const [price_max, setPriceMax] = useQueryState("price_max", parseAsFloat);
  const [rating_min, setRatingMin] = useQueryState("rating_min", parseAsFloat);
  const [rating_max, setRatingMax] = useQueryState("rating_max", parseAsFloat);

  const status = status_filter?.[0] as ProductRow["status"] | undefined;

  const { data: brandsData } = trpc.brands.active.useQuery();
  const { data: categoriesData } = trpc.categories.tree.useQuery();
  const { data, isLoading } = trpc.products.adminList.useQuery({
    page,
    limit: per_page,
    search: search?.trim() || undefined,
    status: status ?? undefined,
    brand_id: brand_id ?? undefined,
    category_id: category_id ?? undefined,
    stock_status: (stock_status ?? undefined) as
      | "in_stock"
      | "low_stock"
      | "out_of_stock"
      | undefined,
    price_min: price_min ?? undefined,
    price_max: price_max ?? undefined,
    rating_min: rating_min ?? undefined,
    rating_max: rating_max ?? undefined,
  });

  const bulk = trpc.products.bulkAction.useMutation({
    onSuccess: (_result, variables) => {
      utils.products.adminList.invalidate();
      setAssignCategoryOpen(false);
      setSelectedCategoryId("");
      const action_labels: Record<string, string> = {
        activate: t("activate"),
        deactivate: t("deactivate"),
        delete: t("delete"),
        assign_category: t("assign_category"),
      };
      toast.success(`${action_labels[variables.action] ?? tc("actions")} — ${variables.product_ids.length} ${t("selected_count").replace("{count}", "")}`);
    },
    onError: (err) => toast.error(err.message),
  });

  
  const items = data?.items ?? [];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "prodPage", perPage: "prodPerPage", sort: "prodSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });
  
  const brandOptions = brandsData?.map((b) => ({ label: b.name, value: b.id })) ?? [];
  const categoryOptions = categoriesData?.map((c) => ({ label: c.name, value: c.id })) ?? [];
  const stockOptions = [
    { label: t("in_stock"), value: "in_stock" },
    { label: t("low_stock"), value: "low_stock" },
    { label: t("out_of_stock"), value: "out_of_stock" },
  ];

  function getSelectedIds() {
    return table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
  }

  function runBulk(action: "activate" | "deactivate" | "delete" | "assign_category") {
    const ids = getSelectedIds();
    if (!ids.length) return;
    if (action === "delete") {
      setBulkDeleteOpen(true);
    } else if (action === "assign_category") {
      setAssignCategoryOpen(true);
    } else {
      bulk.mutate({ product_ids: ids, action });
    }
  }

  function handleAssignCategory() {
    const ids = getSelectedIds();
    if (!ids.length || !selectedCategoryId) return;
    bulk.mutate({ product_ids: ids, action: "assign_category", category_id: selectedCategoryId });
  }

  function handleBulkDelete() {
    const ids = getSelectedIds();
    if (!ids.length) return;
    bulk.mutate({ product_ids: ids, action: "delete" });
    setBulkDeleteOpen(false);
  }

  return (
    <QueryGuard isLoading={isLoading} loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={6} />}>
    <>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_product_placeholder")}
            value={search || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <FacetedFilter
            title={t("brand_title")}
            options={brandOptions}
            icon={Tag}
            value={brand_id ?? undefined}
            onChange={setBrandId}
          />
          <FacetedFilter
            title={t("category_title")}
            options={categoryOptions}
            icon={Folder}
            value={category_id ?? undefined}
            onChange={setCategoryId}
          />
          <FacetedFilter
            title={t("stock_title")}
            options={stockOptions}
            icon={Tag}
            value={stock_status ?? undefined}
            onChange={setStockStatus}
          />
          <RangeFilter
            title={t("price_title")}
            min={0}
            max={100000}
            minValue={price_min}
            maxValue={price_max}
            onMinChange={setPriceMin}
            onMaxChange={setPriceMax}
            unit="DZD"
          />
          <RangeFilter
            title={t("rating_title")}
            min={0}
            max={5}
            minValue={rating_min}
            maxValue={rating_max}
            onMinChange={setRatingMin}
            onMaxChange={setRatingMax}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {table.getFilteredSelectedRowModel().rows.length} {t("selected_count")}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              disabled={bulk.isPending}
              onClick={() => runBulk("activate")}
            >
              {bulk.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
              {t("activate")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={bulk.isPending}
              onClick={() => runBulk("deactivate")}
            >
              {bulk.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Archive className="mr-1 h-4 w-4" />}
              {t("deactivate")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={bulk.isPending}
              onClick={() => runBulk("assign_category")}
            >
              {bulk.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Folder className="mr-1 h-4 w-4" />}
              {t("assign_category")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={bulk.isPending}
              onClick={() => runBulk("delete")}
            >
              {bulk.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
              {t("delete")}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/products/export?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                  ...(brand_id ? { brand_id } : {}),
                  ...(category_id ? { category_id } : {}),
                  ...(stock_status ? { stock_status } : {}),
                  ...(price_min != null ? { price_min: String(price_min) } : {}),
                  ...(price_max != null ? { price_max: String(price_max) } : {}),
                  ...(rating_min != null ? { rating_min: String(rating_min) } : {}),
                  ...(rating_max != null ? { rating_max: String(rating_max) } : {}),
                })}`}
                download="products.csv"
              >
                <Download className="mr-1 h-4 w-4" />
                {t("export")}
              </a>
            </Button>
          </div>
        )}
      </DataTable>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bulk_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("bulk_delete_confirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulk.isPending}>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulk.isPending}
              onClick={handleBulkDelete}
            >
              {bulk.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {bulk.isPending ? tc("loading") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign category dialog */}
      <AlertDialog open={assignCategoryOpen} onOpenChange={setAssignCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("assign_category_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("assign_category_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder={t("select_category_filter")} />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulk.isPending}>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={bulk.isPending || !selectedCategoryId}
              onClick={handleAssignCategory}
            >
              {bulk.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {bulk.isPending ? tc("loading") : t("assign")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
    </QueryGuard>
  );
}
