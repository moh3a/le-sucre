/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useUndoAction } from "@/hooks/use-undo-action";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { build_option_signature, build_sku_code } from "../engines/option-signature.engine";
import type { SkuListRow } from "../types";

type SkuTableProps = {
  product_id: string;
  product_sku: string;
  currency: string;
  on_change?: () => void;
};

function flatten_options(
  options: SkuListRow["options"],
): Record<string, { label: string; value_id: string }> {
  const map: Record<string, { label: string; value_id: string }> = {};
  for (const opt of options) {
    if (opt.property_code) {
      map[opt.property_code] = {
        label: opt.value_label ?? opt.value_code ?? "",
        value_id: opt.value_id ?? "",
      };
    }
  }
  return map;
}

const sku_form_schema = z.object({
  sku_code: z.string().max(128).default(""),
  base_price: z.string().default(""),
  offer_price: z.string().default(""),
  is_active: z.boolean().default(true),
});
type SkuFormValues = z.infer<typeof sku_form_schema>;

const bulk_price_schema = z.object({
  base_price: z.string().default(""),
  offer_price: z.string().default(""),
});
type BulkPriceFormValues = z.infer<typeof bulk_price_schema>;

const bulk_stock_schema = z.object({
  stock: z.string().default(""),
});
type BulkStockFormValues = z.infer<typeof bulk_stock_schema>;

export function SkuTable({ product_id, product_sku, currency, on_change }: SkuTableProps) {
  const t = useTranslations("variants");
  const utils = trpc.useUtils();
  const { execute_with_undo } = useUndoAction();

  const { data, isLoading } = trpc.variants.listSkus.useQuery({ product_id });
  const { data: config } = trpc.variants.getConfig.useQuery({ product_id });

  const invalidate = async () => {
    await utils.variants.listSkus.invalidate({ product_id });
    await utils.variants.getPriceRange.invalidate({ product_id });
    on_change?.();
  };

  const update_sku = trpc.variants.updateSku.useMutation({
    onSuccess: async () => {
      toast.success(t("sku_updated"));
      await invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const delete_sku = trpc.variants.deleteSku.useMutation({
    onError: (err) => toast.error(err.message),
  });
  const create_sku = trpc.variants.createSku.useMutation({
    onSuccess: async () => {
      toast.success(t("sku_created"));
      set_sheet_open(false);
      await invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const bulk_update = trpc.variants.bulkUpdateSku.useMutation({
    onSuccess: async () => {
      setRowSelection({});
      set_bulk_price_dialog_open(false);
      set_bulk_stock_dialog_open(false);
      toast.success(t("bulk_update_success"));
      await invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const bulk_delete = trpc.variants.bulkDeleteSku.useMutation({
    onError: (err) => {
      set_bulk_delete_dialog_open(false);
      toast.error(err.message);
    },
  });

  const [sheet_open, set_sheet_open] = useState(false);
  const [editing_id, set_editing_id] = useState<string | null>(null);
  const [manual_values, set_manual_values] = useState<Record<string, string>>({});

  const sku_form = useForm<SkuFormValues>({
    resolver: zodResolver(sku_form_schema),
    defaultValues: { sku_code: "", base_price: "", offer_price: "", is_active: true },
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [bulk_price_dialog_open, set_bulk_price_dialog_open] = useState(false);
  const [bulk_stock_dialog_open, set_bulk_stock_dialog_open] = useState(false);
  const [bulk_delete_dialog_open, set_bulk_delete_dialog_open] = useState(false);
  const [delete_target, set_delete_target] = useState<{ id: string; code: string } | null>(null);

  const bulk_price_form = useForm<BulkPriceFormValues>({
    resolver: zodResolver(bulk_price_schema),
    defaultValues: { base_price: "", offer_price: "" },
  });

  const bulk_stock_form = useForm<BulkStockFormValues>({
    resolver: zodResolver(bulk_stock_schema),
    defaultValues: { stock: "" },
  });

  const [inline_edits, set_inline_edits] = useState<
    Record<string, { base_price?: string; offer_price?: string; stock_available?: string }>
  >({});

  const items = useMemo(() => (data?.items ?? []) as SkuListRow[], [data?.items]);
  const properties = useMemo(() => config?.properties ?? [], [config?.properties]);

  function open_create() {
    set_editing_id(null);
    sku_form.reset({ sku_code: "", base_price: "", offer_price: "", is_active: true });
    set_manual_values({});
    set_sheet_open(true);
  }

  const open_edit = useCallback(
    (sku_id: string) => {
      const item = items.find((row) => row.sku_id === sku_id);
      if (!item) return;
      set_editing_id(sku_id);
      sku_form.reset({
        sku_code: item.sku_code,
        base_price: item.base_price ?? "",
        offer_price: item.offer_price ?? "",
        is_active: item.is_active,
      });
      set_sheet_open(true);
    },
    [items, sku_form],
  );

  async function on_save_sheet() {
    const values = sku_form.getValues();

    if (editing_id) {
      await update_sku.mutateAsync({
        id: editing_id,
        sku_code: values.sku_code,
        base_price: values.base_price ? Number(values.base_price) : null,
        offer_price: values.offer_price ? Number(values.offer_price) : null,
        is_active: values.is_active,
        currency,
      });
      set_sheet_open(false);
      return;
    }

    const property_value_ids = properties
      .map((p) => manual_values[p.id])
      .filter((id): id is string => Boolean(id));

    if (property_value_ids.length !== properties.length) return;

    const pairs = properties.map((p) => {
      const value = p.values.find((v) => v.id === manual_values[p.id]);
      return { property_code: p.code, value_code: value!.code };
    });

    const signature = build_option_signature(pairs);
    const sku_code = values.sku_code.trim() || build_sku_code(product_sku, signature);

    await create_sku.mutateAsync({
      product_id,
      sku_code,
      barcode: null,
      base_price: values.base_price ? Number(values.base_price) : null,
      offer_price: values.offer_price ? Number(values.offer_price) : null,
      currency,
      is_active: values.is_active,
      property_value_ids,
    });
  }

  const start_inline_edit = useCallback((sku_id: string, field: string, value: string | number) => {
    set_inline_edits((prev) => ({
      ...prev,
      [sku_id]: {
        ...prev[sku_id],
        [field]: String(value),
      },
    }));
  }, []);

  const commit_inline_edit = useCallback(
    async (sku_id: string) => {
      const edit = inline_edits[sku_id];
      if (!edit) return;

      const payload: {
        id: string;
        base_price?: number | null;
        offer_price?: number | null;
      } = { id: sku_id };

      if (edit.base_price !== undefined) {
        payload.base_price = edit.base_price ? Number(edit.base_price) : null;
      }
      if (edit.offer_price !== undefined) {
        payload.offer_price = edit.offer_price ? Number(edit.offer_price) : null;
      }

      await update_sku.mutateAsync(payload);

      set_inline_edits((prev) => {
        const next = { ...prev };
        if (next[sku_id]) {
          const remaining = { ...next[sku_id] };
          delete remaining.base_price;
          delete remaining.offer_price;
          if (Object.keys(remaining).length === 0) {
            delete next[sku_id];
          } else {
            next[sku_id] = remaining;
          }
        }
        return next;
      });
    },
    [inline_edits, update_sku],
  );

  const cancel_inline_edit = useCallback((sku_id: string) => {
    set_inline_edits((prev) => {
      const next = { ...prev };
      delete next[sku_id];
      return next;
    });
  }, []);

  const commit_stock_inline = useCallback(
    async (sku_id: string) => {
      const edit = inline_edits[sku_id];
      if (!edit || edit.stock_available === undefined) return;

      await bulk_update.mutateAsync({
        ids: [sku_id],
        stock_available: Number(edit.stock_available),
      });

      set_inline_edits((prev) => {
        const next = { ...prev };
        if (next[sku_id]) {
          const remaining = { ...next[sku_id] };
          delete remaining.stock_available;
          if (Object.keys(remaining).length === 0) {
            delete next[sku_id];
          } else {
            next[sku_id] = remaining;
          }
        }
        return next;
      });
    },
    [inline_edits, bulk_update],
  );

  const property_columns = useMemo<ColumnDef<SkuListRow>[]>(
    () =>
      properties.map((prop) => ({
        id: `prop_${prop.code}`,
        accessorFn: (row: SkuListRow) => {
          const flat = flatten_options(row.options);
          return flat[prop.code]?.label ?? null;
        },
        header: ({ column }) => <DataTableColumnHeader column={column} label={prop.name} />,
        cell: ({ row }) => {
          const flat = flatten_options(row.original.options);
          const val = flat[prop.code];
          if (!val) return <span className="text-muted-foreground">—</span>;
          const option = row.original.options.find((o) => o.property_code === prop.code);
          return (
            <Badge variant="outline" className="gap-1.5">
              {option?.color_hex ? (
                <span
                  className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border"
                  style={{ backgroundColor: option.color_hex }}
                  title={option.color_hex}
                />
              ) : option?.thumbnail_image ? (
                <img
                  src={option.thumbnail_image}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded object-cover"
                />
              ) : null}
              {val.label}
            </Badge>
          );
        },
        enableSorting: true,
      })),
    [properties],
  );

  const columns = useMemo<ColumnDef<SkuListRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() ?? "indeterminate")
            }
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="text-primary rounded border-gray-300"
            aria-label={t("select_all_label")}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="text-primary rounded border-gray-300"
            aria-label={t("select_row_label")}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "sku_code",
        accessorKey: "sku_code",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("sku_code")} />,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku_code}</span>,
      },
      ...property_columns,
      {
        id: "base_price",
        accessorKey: "base_price",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("base_price")} />,
        cell: ({ row }) => {
          const sku_id = row.original.sku_id;
          const edit = inline_edits[sku_id];
          if (edit?.base_price !== undefined) {
            return (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={edit.base_price}
                  onChange={(e) => start_inline_edit(sku_id, "base_price", e.target.value)}
                  className="h-7 w-20 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit_inline_edit(sku_id);
                    if (e.key === "Escape") cancel_inline_edit(sku_id);
                  }}
                />
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => commit_inline_edit(sku_id)}
                >
                  ✓
                </button>
              </div>
            );
          }
          return (
            <span
              className="hover:bg-accent cursor-pointer rounded px-1 py-0.5"
              onClick={() => {
                const item = items.find((r) => r.sku_id === sku_id);
                start_inline_edit(sku_id, "base_price", item?.base_price ?? "");
              }}
              title={t("click_to_edit_title")}
            >
              {row.original.base_price ?? "—"} {row.original.currency ?? currency}
            </span>
          );
        },
      },
      {
        id: "offer_price",
        accessorKey: "offer_price",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("offer_price")} />,
        cell: ({ row }) => {
          const sku_id = row.original.sku_id;
          const edit = inline_edits[sku_id];
          if (edit?.offer_price !== undefined) {
            return (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={edit.offer_price}
                  onChange={(e) => start_inline_edit(sku_id, "offer_price", e.target.value)}
                  className="h-7 w-20 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit_inline_edit(sku_id);
                    if (e.key === "Escape") cancel_inline_edit(sku_id);
                  }}
                />
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => commit_inline_edit(sku_id)}
                >
                  ✓
                </button>
              </div>
            );
          }
          return (
            <span
              className="hover:bg-accent cursor-pointer rounded px-1 py-0.5"
              onClick={() => {
                const item = items.find((r) => r.sku_id === sku_id);
                start_inline_edit(sku_id, "offer_price", item?.offer_price ?? "");
              }}
              title={t("click_to_edit_title")}
            >
              {row.original.offer_price ?? "—"}
            </span>
          );
        },
      },
      {
        id: "stock_available",
        accessorKey: "stock_available",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("stock")} />,
        cell: ({ row }) => {
          const sku_id = row.original.sku_id;
          const edit = inline_edits[sku_id];
          if (edit?.stock_available !== undefined) {
            return (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={edit.stock_available}
                  onChange={(e) => start_inline_edit(sku_id, "stock_available", e.target.value)}
                  className="h-7 w-16 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit_stock_inline(sku_id);
                    if (e.key === "Escape") cancel_inline_edit(sku_id);
                  }}
                />
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => commit_stock_inline(sku_id)}
                >
                  ✓
                </button>
              </div>
            );
          }
          return (
            <span
              className="hover:bg-accent cursor-pointer rounded px-1 py-0.5"
              onClick={() =>
                start_inline_edit(sku_id, "stock_available", row.original.stock_available)
              }
              title={t("click_to_edit_title")}
            >
              {row.original.stock_available}
            </span>
          );
        },
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("active")} />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? t("active") : t("inactive")}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => open_edit(row.original.sku_id)}
            >
              {t("edit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                set_delete_target({ id: row.original.sku_id, code: row.original.sku_code })
              }
            >
              {t("delete")}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currency,
      open_edit,
      t,
      properties,
      property_columns,
      inline_edits,
      start_inline_edit,
      commit_inline_edit,
      commit_stock_inline,
      cancel_inline_edit,
    ],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: (row) => row.sku_id,
    enableRowSelection: true,
  });

  const selected_ids = useMemo(
    () => table?.getFilteredSelectedRowModel().rows.map((row) => row.id) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowSelection, items],
  );

  async function bulk_toggle_active(active: boolean) {
    if (!selected_ids.length) return;
    await bulk_update.mutateAsync({ ids: selected_ids, is_active: active });
  }

  async function on_save_bulk_price() {
    const { base_price, offer_price } = bulk_price_form.getValues();
    const payload: Record<string, unknown> = { ids: selected_ids };
    if (base_price !== "") {
      payload.base_price = Number(base_price);
    }
    if (offer_price !== "") {
      payload.offer_price = Number(offer_price);
    }
    await bulk_update.mutateAsync(payload as Parameters<typeof bulk_update.mutateAsync>[0]);
  }

  async function on_save_bulk_stock() {
    const { stock } = bulk_stock_form.getValues();
    if (!stock) return;
    await bulk_update.mutateAsync({
      ids: selected_ids,
      stock_available: Number(stock),
    });
  }

  const action_bar = useMemo(
    () =>
      selected_ids.length > 0 ? (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs font-semibold">
            {selected_ids.length} {t("selected_count")}:
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => bulk_toggle_active(true)}
            disabled={bulk_update.isPending}
          >
            {t("activate")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => bulk_toggle_active(false)}
            disabled={bulk_update.isPending}
          >
            {t("deactivate")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              bulk_price_form.reset({ base_price: "", offer_price: "" });
              set_bulk_price_dialog_open(true);
            }}
            disabled={bulk_update.isPending}
          >
            {t("price")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              bulk_stock_form.reset({ stock: "" });
              set_bulk_stock_dialog_open(true);
            }}
            disabled={bulk_update.isPending}
          >
            {t("stock")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs"
            onClick={() => set_bulk_delete_dialog_open(true)}
            disabled={bulk_delete.isPending}
          >
            {t("delete")}
          </Button>
        </div>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected_ids, bulk_update.isPending, bulk_delete.isPending],
  );

  const editing_item = useMemo(
    () => items.find((item) => item.sku_id === editing_id) ?? null,
    [items, editing_id],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<p className="text-muted-foreground text-sm">{t("loading")}</p>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex max-w-sm flex-1 items-center gap-2">
            <Input
              placeholder={t("search_sku_short")}
              value={(table.getColumn("sku_code")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("sku_code")?.setFilterValue(event.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={open_create}
              disabled={properties.length === 0}
            >
              {t("create_sku")}
            </Button>
          </div>
        </div>

        {action_bar && (
          <div className="bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-2">
            {action_bar}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("empty_skus")}</p>
        ) : (
          <DataTable table={table} />
        )}

        <Sheet open={sheet_open} onOpenChange={set_sheet_open}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{editing_id ? t("edit") : t("create_sku")}</SheetTitle>
            </SheetHeader>

            <div className="space-y-4 px-6 py-4">
              {!editing_id &&
                properties.map((property) => (
                  <Field key={property.id}>
                    <FieldLabel>{property.name}</FieldLabel>
                    <select
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={manual_values[property.id] ?? ""}
                      onChange={(e) =>
                        set_manual_values((prev) => ({
                          ...prev,
                          [property.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">{t("select_option")}</option>
                      {property.values.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}

              <FieldGroup className="grid gap-4">
                <Controller
                  name="sku_code"
                  control={sku_form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("sku_code")}</FieldLabel>
                      <Input {...field} placeholder={editing_item?.sku_code ?? "auto"} />
                    </Field>
                  )}
                />
                <Controller
                  name="base_price"
                  control={sku_form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("base_price")}</FieldLabel>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </Field>
                  )}
                />
                <Controller
                  name="offer_price"
                  control={sku_form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("offer_price")}</FieldLabel>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </Field>
                  )}
                />
                <Controller
                  name="is_active"
                  control={sku_form.control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      {t("active")}
                    </label>
                  )}
                />
              </FieldGroup>
            </div>

            <SheetFooter>
              <Button
                type="button"
                onClick={on_save_sheet}
                disabled={create_sku.isPending || update_sku.isPending}
              >
                {(create_sku.isPending || update_sku.isPending) ? t("saving") : t("save")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Dialog open={bulk_price_dialog_open} onOpenChange={set_bulk_price_dialog_open}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("bulk_edit_price_title")}</DialogTitle>
              <DialogDescription>{t("bulk_edit_price_description")}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Controller
                name="base_price"
                control={bulk_price_form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("base_price")}</FieldLabel>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="offer_price"
                control={bulk_price_form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("offer_price")}</FieldLabel>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => set_bulk_price_dialog_open(false)}
                disabled={bulk_update.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={on_save_bulk_price}
                disabled={bulk_update.isPending}
              >
                {bulk_update.isPending ? t("saving") : t("update")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={bulk_stock_dialog_open} onOpenChange={set_bulk_stock_dialog_open}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t("bulk_set_stock_title")}</DialogTitle>
              <DialogDescription>{t("bulk_set_stock_description")}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Controller
                name="stock"
                control={bulk_stock_form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("stock_quantity")}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      {...field}
                      placeholder={t("new_stock_placeholder")}
                    />
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => set_bulk_stock_dialog_open(false)}
                disabled={bulk_update.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={on_save_bulk_stock}
                disabled={bulk_update.isPending || !bulk_stock_form.watch("stock")}
              >
                {bulk_update.isPending ? t("saving") : t("set_stock")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={delete_target !== null}
          onOpenChange={(open) => {
            if (!open) set_delete_target(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete_sku_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete_sku_description", { code: delete_target?.code ?? "" })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={delete_sku.isPending}>
                {t("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={delete_sku.isPending}
                onClick={() => {
                  if (delete_target) {
                    execute_with_undo({
                      description: delete_target.code ?? "",
                      execute: async () => {
                        await delete_sku.mutateAsync({ id: delete_target.id });
                        await invalidate();
                      },
                      rollback: async () => {
                        await invalidate();
                      },
                      undoTimeoutMs: 8_000,
                    });
                    set_delete_target(null);
                  }
                }}
              >
                {delete_sku.isPending ? t("deleting") : t("confirm_delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={bulk_delete_dialog_open} onOpenChange={set_bulk_delete_dialog_open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("bulk_delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("bulk_delete_description", { count: selected_ids.length })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={bulk_delete.isPending}>
                {t("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={bulk_delete.isPending}
                onClick={() => {
                  setRowSelection({});
                  set_bulk_delete_dialog_open(false);
                  execute_with_undo({
                    description: `${selected_ids.length} SKUs`,
                    execute: async () => {
                      await bulk_delete.mutateAsync({ ids: selected_ids });
                      await invalidate();
                    },
                    rollback: async () => {
                      await invalidate();
                    },
                    undoTimeoutMs: 8_000,
                  });
                }}
              >
                {bulk_delete.isPending ? t("deleting") : t("confirm_delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </QueryGuard>
  );
}
