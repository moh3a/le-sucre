"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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

export function SkuTable({ product_id, product_sku, currency, on_change }: SkuTableProps) {
  const t = useTranslations("variants");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.variants.listSkus.useQuery({ product_id });
  const { data: config } = trpc.variants.getConfig.useQuery({ product_id });

  const invalidate = async () => {
    await utils.variants.listSkus.invalidate({ product_id });
    await utils.variants.getPriceRange.invalidate({ product_id });
    on_change?.();
  };

  const update_sku = trpc.variants.updateSku.useMutation({ onSuccess: invalidate });
  const delete_sku = trpc.variants.deleteSku.useMutation({ onSuccess: invalidate });
  const create_sku = trpc.variants.createSku.useMutation({ onSuccess: invalidate });
  const bulk_update = trpc.variants.bulkUpdateSku.useMutation({
    onSuccess: async () => {
      setRowSelection({});
      set_bulk_price_dialog_open(false);
      set_bulk_stock_dialog_open(false);
      await invalidate();
    },
  });
  const bulk_delete = trpc.variants.bulkDeleteSku.useMutation({
    onSuccess: async () => {
      setRowSelection({});
      await invalidate();
    },
  });

  const [sheet_open, set_sheet_open] = useState(false);
  const [editing_id, set_editing_id] = useState<string | null>(null);
  const [form, set_form] = useState({
    sku_code: "",
    barcode: "",
    base_price: "",
    offer_price: "",
    is_active: true,
  });
  const [manual_values, set_manual_values] = useState<Record<string, string>>({});

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [bulk_price_dialog_open, set_bulk_price_dialog_open] = useState(false);
  const [bulk_price_form, set_bulk_price_form] = useState({
    base_price: "",
    offer_price: "",
  });

  const [bulk_stock_dialog_open, set_bulk_stock_dialog_open] = useState(false);
  const [bulk_stock_value, set_bulk_stock_value] = useState("");

  // Inline editing state: { sku_id: { field: value } }
  const [inline_edits, set_inline_edits] = useState<
    Record<string, { base_price?: string; offer_price?: string; stock_available?: string }>
  >({});

  const items = useMemo(() => (data?.items ?? []) as SkuListRow[], [data?.items]);
  const properties = useMemo(() => config?.properties ?? [], [config?.properties]);

  function open_create() {
    set_editing_id(null);
    set_form({
      sku_code: "",
      barcode: "",
      base_price: "",
      offer_price: "",
      is_active: true,
    });
    set_manual_values({});
    set_sheet_open(true);
  }

  const open_edit = useCallback(
    (sku_id: string) => {
      const item = items.find((row) => row.sku_id === sku_id);
      if (!item) return;
      set_editing_id(sku_id);
      set_form({
        sku_code: item.sku_code,
        barcode: "",
        base_price: item.base_price ?? "",
        offer_price: item.offer_price ?? "",
        is_active: item.is_active,
      });
      set_sheet_open(true);
    },
    [items],
  );

  async function on_save_sheet() {
    if (editing_id) {
      await update_sku.mutateAsync({
        id: editing_id,
        sku_code: form.sku_code,
        base_price: form.base_price ? Number(form.base_price) : null,
        offer_price: form.offer_price ? Number(form.offer_price) : null,
        is_active: form.is_active,
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
    const sku_code = form.sku_code.trim() || build_sku_code(product_sku, signature);

    await create_sku.mutateAsync({
      product_id,
      sku_code,
      barcode: form.barcode || null,
      base_price: form.base_price ? Number(form.base_price) : null,
      offer_price: form.offer_price ? Number(form.offer_price) : null,
      currency,
      is_active: form.is_active,
      property_value_ids,
    });
    set_sheet_open(false);
  }

  // Inline edit handlers
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
        delete next[sku_id];
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

      // Update stock via the single SKU update — stock_available is not in update_sku_dto
      // so use bulk_update with a single ID
      await bulk_update.mutateAsync({
        ids: [sku_id],
        stock_available: Number(edit.stock_available),
      });

      set_inline_edits((prev) => {
        const next = { ...prev };
        delete next[sku_id];
        return next;
      });
    },
    [inline_edits, bulk_update],
  );

  // Dynamic property columns
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
          return <Badge variant="outline">{val.label}</Badge>;
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
            className="rounded border-gray-300 text-[#c8d152]"
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="rounded border-gray-300 text-[#c8d152]"
            aria-label="Select row"
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
              title="Cliquer pour modifier"
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
              title="Cliquer pour modifier"
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
              title="Cliquer pour modifier"
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
              onClick={() => {
                if (!window.confirm(t("confirm_delete_sku"))) return;
                delete_sku.mutate({ id: row.original.sku_id });
              }}
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
      delete_sku,
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

  // Bulk actions
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
    await bulk_update.mutateAsync({
      ids: selected_ids,
      base_price: bulk_price_form.base_price ? Number(bulk_price_form.base_price) : null,
      offer_price: bulk_price_form.offer_price ? Number(bulk_price_form.offer_price) : null,
    });
  }

  async function on_save_bulk_stock() {
    if (!bulk_stock_value) return;
    await bulk_update.mutateAsync({
      ids: selected_ids,
      stock_available: Number(bulk_stock_value),
    });
  }

  async function on_bulk_delete() {
    if (!window.confirm("Voulez-vous vraiment supprimer les variantes sélectionnées ?")) return;
    await bulk_delete.mutateAsync({ ids: selected_ids });
  }

  const action_bar = useMemo(
    () =>
      selected_ids.length > 0 ? (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs font-semibold">
            {selected_ids.length} sélectionné(s) :
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => bulk_toggle_active(true)}
            disabled={bulk_update.isPending}
          >
            Activer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => bulk_toggle_active(false)}
            disabled={bulk_update.isPending}
          >
            Désactiver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              set_bulk_price_form({ base_price: "", offer_price: "" });
              set_bulk_price_dialog_open(true);
            }}
            disabled={bulk_update.isPending}
          >
            Prix
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              set_bulk_stock_value("");
              set_bulk_stock_dialog_open(true);
            }}
            disabled={bulk_update.isPending}
          >
            Stock
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs"
            onClick={on_bulk_delete}
            disabled={bulk_delete.isPending}
          >
            Supprimer
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

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex max-w-sm flex-1 items-center gap-2">
          <Input
            placeholder="Rechercher par SKU..."
            value={(table.getColumn("sku_code")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("sku_code")?.setFilterValue(event.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={open_create} disabled={properties.length === 0}>
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
              <Field>
                <FieldLabel>{t("sku_code")}</FieldLabel>
                <Input
                  value={form.sku_code}
                  onChange={(e) => set_form((f) => ({ ...f, sku_code: e.target.value }))}
                  placeholder={editing_item?.sku_code ?? "auto"}
                />
              </Field>
              <Field>
                <FieldLabel>{t("base_price")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) => set_form((f) => ({ ...f, base_price: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel>{t("offer_price")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.offer_price}
                  onChange={(e) => set_form((f) => ({ ...f, offer_price: e.target.value }))}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set_form((f) => ({ ...f, is_active: e.target.checked }))}
                />
                {t("active")}
              </label>
            </FieldGroup>
          </div>

          <SheetFooter>
            <Button
              type="button"
              onClick={on_save_sheet}
              disabled={create_sku.isPending || update_sku.isPending}
            >
              {t("save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={bulk_price_dialog_open} onOpenChange={set_bulk_price_dialog_open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les prix en masse</DialogTitle>
            <DialogDescription>
              Entrez les nouveaux prix pour les variantes sélectionnées. Laissez vide pour ne pas
              modifier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Field>
              <FieldLabel>{t("base_price")}</FieldLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={bulk_price_form.base_price}
                onChange={(e) => set_bulk_price_form((f) => ({ ...f, base_price: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>{t("offer_price")}</FieldLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={bulk_price_form.offer_price}
                onChange={(e) =>
                  set_bulk_price_form((f) => ({ ...f, offer_price: e.target.value }))
                }
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => set_bulk_price_dialog_open(false)}
            >
              Annuler
            </Button>
            <Button type="button" onClick={on_save_bulk_price} disabled={bulk_update.isPending}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulk_stock_dialog_open} onOpenChange={set_bulk_stock_dialog_open}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Définir le stock en masse</DialogTitle>
            <DialogDescription>
              Définit la quantité en stock pour toutes les variantes sélectionnées.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Field>
              <FieldLabel>Quantité en stock</FieldLabel>
              <Input
                type="number"
                min={0}
                step="1"
                value={bulk_stock_value}
                onChange={(e) => set_bulk_stock_value(e.target.value)}
                placeholder="Nouveau stock"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => set_bulk_stock_dialog_open(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={on_save_bulk_stock}
              disabled={bulk_update.isPending || !bulk_stock_value}
            >
              Définir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
