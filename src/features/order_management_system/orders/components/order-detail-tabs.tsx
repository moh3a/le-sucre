"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import { formatDate } from "@/lib/format";
import { ShipmentPanel } from "@/features/shipping_management_system/components/shipment-panel";
import { ReturnPanel } from "@/features/order_management_system/return_replacement/components/return-panel";
import { OrderOperationsTab } from "./order-operations-tab";
import { OrderCommentsTab } from "./order-comments-tab";
import { TimelineTab } from "./timeline-tab";
import {
  PAYMENT_STATUS_OPTIONS,
  ORDER_LABELS,
  PAYMENT_LABELS,
  FULFILLMENT_LABELS,
  PAYMENT_BADGE,
  FULFILLMENT_BADGE,
  STATUS_BADGE,
} from "../constants/order-status";

type OrderDetailTabsProps = { order_id: string };

const STATUS_OPTIONS_FIXED = [
  { value: "pending_payment", label: "En attente de paiement" },
  { value: "paid", label: "Payé" },
  { value: "processing", label: "En cours" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "failed_delivery", label: "Livraison échouée" },
  { value: "cancelled", label: "Annulée" },
  { value: "refunded", label: "Remboursée" },
] as const;

type EditableItem = {
  id: string;
  sku_id: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  unit_price: number;
};

export function OrderDetailTabs({ order_id }: OrderDetailTabsProps) {
  const t = useTranslations("orders");
  const { data, isLoading, refetch } = trpc.orders.adminGet.useQuery({ order_id });
  const transition = trpc.orders.adminTransition.useMutation({ onSuccess: () => refetch() });
  const STATUS_OPTIONS = STATUS_OPTIONS_FIXED.map((o) => ({
    ...o,
    label: o.value === "processing" ? t("processing") : o.label,
  }));
  const [next_status, set_next_status] = useState<string>("");

  const { data: operators_data, isLoading: operators_loading } =
    trpc.adminAuth.listUsersByRole.useQuery({ role: "operator" });
  const { data: deliverers_data, isLoading: deliverers_loading } =
    trpc.adminAuth.listUsersByRole.useQuery({ role: "delivery_person" });

  const assign_operator = trpc.orders.adminAssignOperator.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Opérateur assigné avec succès");
    },
    onError: (err) => toast.error(`Erreur d'affectation: ${err.message}`),
  });

  const assign_delivery = trpc.orders.adminAssignDeliveryPerson.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Livreur assigné avec succès");
    },
    onError: (err) => toast.error(`Erreur d'affectation: ${err.message}`),
  });

  // ── Payment editing ──
  const [pay_status, set_pay_status] = useState("");
  const [pay_provider, set_pay_provider] = useState("");
  const [pay_reference, set_pay_reference] = useState("");

  const update_payment = trpc.orders.adminUpdatePayment.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Paiement mis à jour");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  // ── Items editing ──
  const update_items = trpc.orders.adminUpdateItems.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Articles mis à jour");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  // ── Shipping editing ──
  const [ship_full_name, set_ship_full_name] = useState("");
  const [ship_phone, set_ship_phone] = useState("");
  const [ship_line1, set_ship_line1] = useState("");
  const [ship_line2, set_ship_line2] = useState("");
  const [ship_city, set_ship_city] = useState("");
  const [ship_state, set_ship_state] = useState("");
  const [ship_postal, set_ship_postal] = useState("");
  const [ship_country, set_ship_country] = useState("DZ");

  const update_shipping = trpc.orders.adminUpdateShipping.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Adresse de livraison mise à jour");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  // ── Invoice operations ──
  const { data: invoices_data, refetch: refetch_invoices } = trpc.invoices.list_by_order.useQuery(
    { order_id },
    { enabled: !!order_id },
  );

  const generate_invoice = trpc.invoices.generate_invoice.useMutation({
    onSuccess: () => {
      refetch();
      refetch_invoices();
      toast.success("Facture générée avec succès");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const mark_invoice_paid = trpc.invoices.mark_as_paid.useMutation({
    onSuccess: () => {
      refetch_invoices();
      toast.success("Facture marquée comme payée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const void_invoice = trpc.invoices.void_invoice.useMutation({
    onSuccess: () => {
      refetch_invoices();
      toast.success("Facture annulée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  // ── Add item to order ──
  const [search_query, set_search_query] = useState("");
  const [selected_sku_id, set_selected_sku_id] = useState("");
  const [add_qty, set_add_qty] = useState(1);
  const [add_price, set_add_price] = useState("");

  const { data: skus_data } = trpc.variants.adminList.useQuery(
    { page: 1, limit: 20, search: search_query || undefined },
    { enabled: search_query.length > 0 },
  );

  // ── Items editing state (must be before early returns for hook order) ──
  const [edit_items, set_edit_items] = useState<EditableItem[]>([]);
  const edit_items_total = useMemo(
    () => edit_items.reduce((s, i) => s + i.unit_price * i.quantity, 0),
    [edit_items],
  );

  if (!data) return <p className="text-muted-foreground">{t("order_not_found")}</p>;

  const { order, items, adjustments, status_events } = data;
  const shipping_addr = order.shipping_address as Record<string, string>;

  // ── Payment handlers ──
  function init_payment_form() {
    set_pay_status(order.payment_status);
    set_pay_provider(order.payment_provider ?? "");
    set_pay_reference(order.payment_reference ?? "");
  }

  function on_save_payment() {
    update_payment.mutate({
      order_id: order.id,
      payment_status: pay_status as "pending" | "authorized" | "paid" | "failed" | "refunded",
      payment_provider: pay_provider || null,
      payment_reference: pay_reference || null,
    });
  }

  // ── Items handlers ──

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
      toast.error("Ce SKU est déjà dans la commande");
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
      toast.error("La commande doit avoir au moins un article");
      return;
    }
    update_items.mutate({
      order_id: order.id,
      items: edit_items.map((i) => ({
        id: i.id.startsWith("new_") ? undefined : i.id,
        sku_id: i.sku_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });
  }

  // ── Shipping handlers ──
  function init_shipping_form() {
    set_ship_full_name(shipping_addr.full_name ?? "");
    set_ship_phone(shipping_addr.phone ?? "");
    set_ship_line1(shipping_addr.line1 ?? "");
    set_ship_line2(shipping_addr.line2 ?? "");
    set_ship_city(shipping_addr.city ?? "");
    set_ship_state(shipping_addr.state ?? "");
    set_ship_postal(shipping_addr.postal_code ?? "");
    set_ship_country(shipping_addr.country_code ?? "DZ");
  }

  function on_save_shipping() {
    update_shipping.mutate({
      order_id: order.id,
      shipping_address: {
        full_name: ship_full_name,
        phone: ship_phone,
        line1: ship_line1,
        line2: ship_line2 || null,
        city: ship_city,
        state: ship_state || null,
        postal_code: ship_postal || null,
        country_code: ship_country,
      },
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
    <QueryGuard query={{ isLoading }} loadingFallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />))}</div>}>
    <Tabs defaultValue="general">
      <TabsList className="mb-4">
        <TabsTrigger value="general">{t("general_tab")}</TabsTrigger>
        <TabsTrigger value="items">{t("items_tab")} ({items.length})</TabsTrigger>
        <TabsTrigger value="shipping">{t("shipping_tab")}</TabsTrigger>
        <TabsTrigger value="payments">{t("payments_tab")}</TabsTrigger>
        <TabsTrigger value="invoices">Factures</TabsTrigger>
        <TabsTrigger value="returns">Retours</TabsTrigger>
        <TabsTrigger value="operations">Opérations</TabsTrigger>
        <TabsTrigger value="comments">Commentaires</TabsTrigger>
        <TabsTrigger value="timeline">{t("timeline_tab")}</TabsTrigger>
      </TabsList>

      {/* ── General ─────────────────────────────────── */}
      <TabsContent value="general" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("status_column")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={STATUS_BADGE[order.status] ?? "secondary"}>
                {ORDER_LABELS[order.status] ?? order.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("payment_column")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={PAYMENT_BADGE[order.payment_status] ?? "outline"}>
                {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("shipping_column")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={FULFILLMENT_BADGE[order.fulfillment_status] ?? "outline"}>
                {FULFILLMENT_LABELS[order.fulfillment_status] ?? order.fulfillment_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif financier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{Number(order.subtotal).toLocaleString("fr-FR")} DZD</span>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Réduction</span>
                <span>−{Number(order.discount_total).toLocaleString("fr-FR")} DZD</span>
              </div>
            )}
            {Number(order.tax_total) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>{Number(order.tax_total).toLocaleString("fr-FR")} DZD</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>{Number(order.shipping_total).toLocaleString("fr-FR")} DZD</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{Number(order.grand_total).toLocaleString("fr-FR")} DZD</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changer le statut</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select onValueChange={set_next_status} value={next_status}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder={t("select_status_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((s) => s.value !== order.status).map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!next_status || transition.isPending}
              onClick={() => transition.mutate({ order_id: order.id, status: next_status })}
            >
              Appliquer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affectation du personnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-muted-foreground text-xs font-medium">Opérateur</label>
                <Select
                  value={order.assigned_operator_id ?? "unassigned"}
                  onValueChange={(val) =>
                    assign_operator.mutate({
                      order_id: order.id,
                      operator_id: val === "unassigned" ? null : val,
                    })
                  }
                  disabled={operators_loading || assign_operator.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("select_operator_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assigné</SelectItem>
                    {operators_data?.map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name} ({op.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-muted-foreground text-xs font-medium">Livreur</label>
                <Select
                  value={order.assigned_delivery_person_id ?? "unassigned"}
                  onValueChange={(val) =>
                    assign_delivery.mutate({
                      order_id: order.id,
                      delivery_person_id: val === "unassigned" ? null : val,
                    })
                  }
                  disabled={deliverers_loading || assign_delivery.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("select_delivery_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assigné</SelectItem>
                    {deliverers_data?.map((del) => (
                      <SelectItem key={del.id} value={del.id}>
                        {del.name} ({del.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <NotesCard order_id={order.id} initial_notes={order.notes ?? ""} on_saved={refetch} />
      </TabsContent>

      {/* ── Items ───────────────────────────────────── */}
      <TabsContent value="items">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Articles de la commande</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={init_items_form}>
                Modifier les articles
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Produit</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-right font-medium">Qté</th>
                  <th className="px-4 py-3 text-right font-medium">Prix unit.</th>
                  <th className="px-4 py-3 text-right font-medium">Total ligne</th>
                  <th className="px-4 py-3 text-left font-medium">Livraison</th>
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

        {/* Inline items editor */}
        {edit_items.length > 0 && (
          <Card className="mt-4 border-blue-200">
            <CardHeader>
              <CardTitle>Édition des articles</CardTitle>
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
                  <span>Total</span>
                  <span>{edit_items_total.toLocaleString("fr-FR")} DZD</span>
                </div>
              </div>

              {/* Add item to order */}
              <div className="rounded-md border p-3">
                <p className="mb-2 text-xs font-medium">Ajouter un article</p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="relative min-w-[200px] flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2" />
                    <Input
                      className="h-8 pl-7 text-xs"
                      placeholder={t("search_sku_placeholder")}
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
                        <p className="text-muted-foreground p-2">Aucun résultat</p>
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
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={add_item_to_list}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Ajouter
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => set_edit_items([])}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={on_save_items}
                  disabled={update_items.isPending || edit_items.length === 0}
                >
                  {update_items.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {adjustments.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Ajustements</CardTitle>
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
      </TabsContent>

      {/* ── Shipping ────────────────────────────────── */}
      <TabsContent value="shipping">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Adresse de livraison</CardTitle>
            <Button size="sm" variant="outline" onClick={init_shipping_form}>
              Modifier l&apos;adresse
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{shipping_addr.full_name}</p>
            <p>{shipping_addr.phone}</p>
            <p>{shipping_addr.line1}</p>
            {shipping_addr.line2 && <p>{shipping_addr.line2}</p>}
            <p>
              {shipping_addr.city}
              {shipping_addr.postal_code ? `, ${shipping_addr.postal_code}` : ""}
            </p>
            <p>{shipping_addr.country_code}</p>
          </CardContent>
        </Card>

        {/* Inline shipping editor */}
        {ship_full_name !== "" && (
          <Card className="mt-4 border-blue-200">
            <CardHeader>
              <CardTitle>Modifier l&apos;adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Field>
                  <FieldLabel>Nom complet</FieldLabel>
                  <Input
                    value={ship_full_name}
                    onChange={(e) => set_ship_full_name(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Téléphone</FieldLabel>
                  <Input value={ship_phone} onChange={(e) => set_ship_phone(e.target.value)} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Adresse</FieldLabel>
                <Input value={ship_line1} onChange={(e) => set_ship_line1(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Complément d&apos;adresse</FieldLabel>
                <Input value={ship_line2} onChange={(e) => set_ship_line2(e.target.value)} />
              </Field>
              <div className="grid gap-3 md:grid-cols-3">
                <Field>
                  <FieldLabel>Ville</FieldLabel>
                  <Input value={ship_city} onChange={(e) => set_ship_city(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Wilaya / État</FieldLabel>
                  <Input value={ship_state} onChange={(e) => set_ship_state(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Code postal</FieldLabel>
                  <Input value={ship_postal} onChange={(e) => set_ship_postal(e.target.value)} />
                </Field>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => set_ship_full_name("")}>
                  Annuler
                </Button>
                <Button size="sm" onClick={on_save_shipping} disabled={update_shipping.isPending}>
                  {update_shipping.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <ShipmentPanel order_id={order_id} />
      </TabsContent>

      {/* ── Payments ────────────────────────────────── */}
      <TabsContent value="payments">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Informations de paiement</CardTitle>
            <Button size="sm" variant="outline" onClick={init_payment_form}>
              Modifier le paiement
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-36">Statut</span>
              <Badge variant={PAYMENT_BADGE[order.payment_status] ?? "outline"}>
                {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-36">Prestataire</span>
              <span>{order.payment_provider ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-36">Référence</span>
              <span className="font-mono text-xs">{order.payment_reference ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-36">Montant total</span>
              <span className="font-semibold">
                {Number(order.grand_total).toLocaleString("fr-FR")} DZD
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Inline payment editor */}
        {pay_status && (
          <Card className="mt-4 border-blue-200">
            <CardHeader>
              <CardTitle>Modifier le paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field>
                <FieldLabel>Statut</FieldLabel>
                <Select value={pay_status} onValueChange={set_pay_status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Prestataire</FieldLabel>
                <Input
                  value={pay_provider}
                  onChange={(e) => set_pay_provider(e.target.value)}
                  placeholder={t("payment_method_placeholder")}
                />
              </Field>
              <Field>
                <FieldLabel>Référence</FieldLabel>
                <Input
                  value={pay_reference}
                  onChange={(e) => set_pay_reference(e.target.value)}
                  placeholder={t("transaction_id_placeholder")}
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => set_pay_status("")}>
                  Annuler
                </Button>
                <Button size="sm" onClick={on_save_payment} disabled={update_payment.isPending}>
                  {update_payment.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── Invoices ────────────────────────────────── */}
      <TabsContent value="invoices" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Factures liées</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generate_invoice.mutate({ order_id: order.id })}
              disabled={generate_invoice.isPending}
            >
              <FileText className="mr-1 h-3 w-3" />
              Générer une facture
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {!invoices_data || invoices_data.length === 0 ? (
              <p className="text-muted-foreground p-4 text-sm">
                Aucune facture pour cette commande.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">N° Facture</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Statut</th>
                    <th className="px-4 py-3 text-right font-medium">Montant</th>
                    <th className="px-4 py-3 text-left font-medium">Créée le</th>
                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices_data.map((inv) => {
                    const type_label =
                      inv.type === "order_invoice"
                        ? "Facture"
                        : inv.type === "refund_invoice"
                          ? "Remboursement"
                          : "Avoir";
                    const status_label =
                      inv.status === "unpaid"
                        ? "Impayée"
                        : inv.status === "paid"
                          ? "Payée"
                          : inv.status === "void"
                            ? "Annulée"
                            : inv.status === "refunded"
                              ? "Remboursée"
                              : "Partiellement remboursée";
                    const status_variant: Record<
                      string,
                      "default" | "secondary" | "destructive" | "outline"
                    > = {
                      unpaid: "outline",
                      paid: "default",
                      void: "destructive",
                      refunded: "secondary",
                      partially_refunded: "secondary",
                    };
                    return (
                      <tr key={inv.id}>
                        <td className="px-4 py-3 font-mono text-xs font-medium">
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-xs">{type_label}</td>
                        <td className="px-4 py-3">
                          <Badge variant={status_variant[inv.status] ?? "outline"}>
                            {status_label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {Number(inv.grand_total).toLocaleString("fr-FR")} DZD
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">
                          {formatDate(inv.created_at, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() =>
                                window.open(`/api/admin/invoices/${inv.id}/download`, "_blank")
                              }
                            >
                              Voir
                            </Button>
                            {inv.status === "unpaid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => mark_invoice_paid.mutate({ id: inv.id })}
                                disabled={mark_invoice_paid.isPending}
                              >
                                Marquer payée
                              </Button>
                            )}
                            {(inv.status === "unpaid" || inv.status === "paid") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-red-500"
                                onClick={() => void_invoice.mutate({ id: inv.id })}
                                disabled={void_invoice.isPending}
                              >
                                Annuler
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Returns & Replacements ──────────────────── */}
      <TabsContent value="returns">
        <ReturnPanel
          order_id={order.id}
          items={items.map((i) => ({
            id: i.id,
            sku_id: i.sku_id,
            product_name: i.product_name,
            sku_code: i.sku_code,
            quantity: i.quantity,
            unit_price: i.unit_price,
          }))}
          order_status={order.status}
          on_update={refetch}
        />
      </TabsContent>

      {/* ── Operations ──────────────────────────────── */}
      <TabsContent value="operations">
        <OrderOperationsTab order_id={order.id} order_status={order.status} />
      </TabsContent>

      {/* ── Comments ────────────────────────────────── */}
      <TabsContent value="comments">
        <OrderCommentsTab order_id={order.id} />
      </TabsContent>

      {/* ── Timeline ────────────────────────────────── */}
      <TabsContent value="timeline">
        <TimelineTab order_id={order.id} />
      </TabsContent>
    </Tabs>
    </QueryGuard>
  );
}

type NotesCardProps = { order_id: string; initial_notes: string; on_saved: () => void };

function NotesCard({ order_id, initial_notes, on_saved }: NotesCardProps) {
  const [draft, set_draft] = useState(initial_notes);
  const update_notes = trpc.orders.adminUpdateNotes.useMutation({
    onSuccess: () => {
      on_saved();
      toast.success("Notes sauvegardées");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes internes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          id="order-notes"
          rows={5}
          placeholder={t("internal_note_placeholder")}
          value={draft}
          onChange={(e) => set_draft(e.target.value)}
          className="resize-none text-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={update_notes.isPending}
            onClick={() => update_notes.mutate({ order_id, notes: draft || null })}
          >
            Sauvegarder
          </Button>
          {draft && (
            <Button
              size="sm"
              variant="outline"
              disabled={update_notes.isPending}
              onClick={() => {
                set_draft("");
                update_notes.mutate({ order_id, notes: null });
              }}
            >
              Effacer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
