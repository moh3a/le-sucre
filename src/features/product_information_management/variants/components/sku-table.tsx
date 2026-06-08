"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { build_option_signature, build_sku_code } from "../engines/option-signature.engine";

type SkuTableProps = {
  product_id: string;
  product_sku: string;
  currency: string;
  on_change?: () => void;
};

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

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const properties = config?.properties ?? [];

  const editing_item = useMemo(
    () => items.find((item) => item.sku_id === editing_id) ?? null,
    [items, editing_id],
  );

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

  function open_edit(sku_id: string) {
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
  }

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

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button">
          TODO: bulk action
        </Button>
        <Button type="button" onClick={open_create} disabled={properties.length === 0}>
          {t("create_sku")}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("empty_skus")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">{t("sku_code")}</th>
                <th className="p-3">{t("options")}</th>
                <th className="p-3">{t("base_price")}</th>
                <th className="p-3">{t("offer_price")}</th>
                <th className="p-3">{t("stock")}</th>
                <th className="p-3">{t("active")}</th>
                <th className="p-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.sku_id} className="border-t">
                  <td className="p-3 font-mono text-xs">{row.sku_code}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {row.options.map((opt) => (
                        <Badge key={`${row.sku_id}-${opt.value_id}`} variant="outline">
                          {opt.value_label ?? opt.value_code}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {row.base_price ?? "—"} {row.currency ?? currency}
                  </td>
                  <td className="p-3">{row.offer_price ?? "—"}</td>
                  <td className="p-3">{row.stock_available}</td>
                  <td className="p-3">
                    <Badge variant={row.is_active ? "default" : "secondary"}>
                      {row.is_active ? t("active") : t("inactive")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => open_edit(row.sku_id)}
                      >
                        {t("edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!window.confirm(t("confirm_delete_sku"))) return;
                          delete_sku.mutate({ id: row.sku_id });
                        }}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={sheet_open} onOpenChange={set_sheet_open}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing_id ? t("edit") : t("create_sku")}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-6">
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
    </div>
  );
}
