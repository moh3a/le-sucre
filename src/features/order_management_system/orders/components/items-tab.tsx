"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EditableItem = {
  id: string;
  sku_id: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  unit_price: number;
};

type ItemsTabProps = {
  order_id: string;
  items: Array<{
    id: string;
    sku_id: string;
    product_name: string;
    sku_code: string;
    quantity: number;
    unit_price: string;
    line_total: string;
    fulfillment_type: string;
  }>;
  adjustments: Array<{
    id: string;
    label: string;
    type: string;
    amount: string;
  }>;
  on_update: () => void;
};

export function ItemsTab({ order_id, items, adjustments, on_update }: ItemsTabProps) {
  const t = useTranslations("orders");
  const update_items = trpc.orders.adminUpdateItems.useMutation({
    onSuccess: () => {
      on_update();
      toast.success(t("items_updated"));
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  const [search_query, set_search_query] = useState("");
  const [selected_sku_id, set_selected_sku_id] = useState("");
  const [add_qty, set_add_qty] = useState(1);
  const [add_price, set_add_price] = useState("");

  const { data: skus_data } = trpc.variants.adminList.useQuery(
    { page: 1, limit: 20, search: search_query || undefined },
    { enabled: search_query.length > 0 },
  );

  const [edit_items, set_edit_items] = useState<EditableItem[]>([]);
  const edit_items_total = useMemo(
    () => edit_items.reduce((s, i) => s + i.unit_price * i.quantity, 0),
    [edit_items],
  );

  function init_items_form() {
    set_edit_items(
      items.map((i) => ({
        id: i.id,
        sku_id: i.sku_id,
        product_name: i.product_name,
        sku_code: i.sku_code,
        quantity: i.quantity,
        unit_price: Number(i.unit_price),
      })),
    );
  }

  function update_item_qty(item_id: string, qty: number) {
    set_edit_items((prev) =>
      prev.map((i) => (i.id === item_id ? { ...i, quantity: Math.max(1, qty) } : i)),
    );
  }

  function remove_item(item_id: string) {
    set_edit_items((prev) => prev.filter((i) => i.id !== item_id));
  }

  function add_item_to_list() {
    const sku = skus_data?.items?.find((s) => s.id === selected_sku_id);
    if (!sku) return;
    if (edit_items.some((i) => i.sku_id === sku.id)) {
      toast.error(t("sku_already_in_order"));
      return;
    }
    set_edit_items((prev) => [
      ...prev,
      {
        id: `new_${sku.id}`,
        sku_id: sku.id,
        product_name: sku.product_name ?? sku.sku_code,
        sku_code: sku.sku_code,
        quantity: add_qty,
        unit_price: add_price ? Number(add_price) : Number(sku.offer_price ?? sku.base_price ?? 0),
      },
    ]);
    set_selected_sku_id("");
    set_add_qty(1);
    set_add_price("");
    set_search_query("");
  }

  function on_save_items() {
    if (edit_items.length === 0) {
      toast.error(t("order_must_have_items"));
      return;
    }
    update_items.mutate({
      order_id,
      items: edit_items.map((i) => ({
        id: i.id.startsWith("new_") ? undefined : i.id,
        sku_id: i.sku_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });
  }

  const sku_options = (skus_data?.items ?? [])
    .map((s) => ({
      sku_id: s.id,
      sku_code: s.sku_code,
      product_name: s.product_name ?? s.sku_code,
      unit_price: Number(s.offer_price ?? s.base_price ?? 0),
    }))
    .filter((s) => !edit_items.some((i) => i.sku_id === s.sku_id));

  return (
    <QueryGuard query={{isLoading: false}}>
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("articles_commande")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={init_items_form}>
              {t("modifier_articles")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t("produit")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("sku")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("qte")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("prix_unitaire")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("total_ligne")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("livraison")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.product_name}</td>
                  <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                    {item.sku_code}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {Number(item.unit_price).toLocaleString("fr-FR")} DZD
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {Number(item.line_total).toLocaleString("fr-FR")} DZD
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{item.fulfillment_type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {edit_items.length > 0 && (
        <Card className="mt-4 border-blue-200">
          <CardHeader>
            <CardTitle>{t("edition_articles")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y rounded-md border">
              {edit_items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.product_name}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {item.sku_code}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={9999}
                    value={item.quantity}
                    onChange={(e) => update_item_qty(item.id, Number(e.target.value))}
                    className="h-8 w-20 text-xs"
                  />
                  <span className="text-muted-foreground w-24 text-right text-xs">
                    {(item.unit_price * item.quantity).toLocaleString("fr-FR")} DZD
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => remove_item(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>{t("total")}</span>
                <span>{edit_items_total.toLocaleString("fr-FR")} DZD</span>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <p className="mb-2 text-xs font-medium">{t("ajouter_article")}</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2" />
                  <Input
                    className="h-8 pl-7 text-xs"
                    placeholder={t("search_sku")}
                    value={search_query}
                    onChange={(e) => {
                      set_search_query(e.target.value);
                      set_selected_sku_id("");
                    }}
                  />
                </div>
                {search_query && (
                  <div className="max-h-[120px] w-full overflow-y-auto rounded border text-xs">
                    {sku_options.length === 0 ? (
                      <p className="text-muted-foreground p-2">{t("no_results")}</p>
                    ) : (
                      sku_options.slice(0, 6).map((sku) => (
                        <label
                          key={sku.sku_id}
                          className={`hover:bg-muted/40 flex cursor-pointer items-center gap-2 px-2 py-1.5 ${
                            selected_sku_id === sku.sku_id ? "bg-muted/60" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="sku_add"
                            checked={selected_sku_id === sku.sku_id}
                            onChange={() => {
                              set_selected_sku_id(sku.sku_id);
                              set_add_price(String(sku.unit_price));
                            }}
                          />
                          <span className="flex-1 truncate">{sku.product_name}</span>
                          <span className="text-muted-foreground truncate font-mono">
                            {sku.sku_code}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
                {selected_sku_id && (
                  <>
                    <Input
                      type="number"
                      min={1}
                      value={add_qty}
                      onChange={(e) => set_add_qty(Math.max(1, Number(e.target.value)))}
                      className="h-8 w-16 text-xs"
                      placeholder={t("qty_placeholder")}
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={add_price}
                      onChange={(e) => set_add_price(e.target.value)}
                      className="h-8 w-24 text-xs"
                      placeholder={t("unit_price_placeholder")}
                    />
                    <Button type="button" size="sm" className="h-8 text-xs" onClick={add_item_to_list}>
                      <Plus className="mr-1 h-3 w-3" />
                      {t("ajouter")}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_edit_items([])}>
                {t("annuler")}
              </Button>
              <Button
                size="sm"
                onClick={on_save_items}
                disabled={update_items.isPending || edit_items.length === 0}
              >
                {update_items.isPending ? t("saving") : t("save_modifications")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {adjustments.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t("ajustements")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {adjustments.map((adj) => (
              <div key={adj.id} className="flex justify-between">
                <span className="text-muted-foreground">{adj.label}</span>
                <span>
                  {adj.type === "discount" ? "−" : "+"}
                  {Number(adj.amount).toLocaleString("fr-FR")} DZD
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
    </QueryGuard>
  );
}
