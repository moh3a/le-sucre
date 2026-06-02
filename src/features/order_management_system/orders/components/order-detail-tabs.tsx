"use client";

import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { useState } from "react";

type OrderDetailTabsProps = { order_id: string };

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "En attente de paiement" },
  { value: "paid", label: "Payé" },
  { value: "processing", label: "En cours" },
  { value: "fulfilled", label: "Livré" },
  { value: "cancelled", label: "Annulé" },
] as const;

export function OrderDetailTabs({ order_id }: OrderDetailTabsProps) {
  const { data, isLoading, refetch } = trpc.orders.adminGet.useQuery({ order_id });
  const transition = trpc.orders.adminTransition.useMutation({ onSuccess: () => refetch() });
  const [next_status, set_next_status] = useState<string>("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }
  if (!data) return <p className="text-muted-foreground">Commande introuvable.</p>;

  const { order, items, adjustments, status_events } = data;
  const shipping_addr = order.shipping_address as Record<string, string>;

  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-4">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="items">Articles ({items.length})</TabsTrigger>
        <TabsTrigger value="shipping">Expédition</TabsTrigger>
        <TabsTrigger value="payments">Paiements</TabsTrigger>
        <TabsTrigger value="timeline">Chronologie</TabsTrigger>
      </TabsList>

      {/* ── General ─────────────────────────────────── */}
      <TabsContent value="general" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Statut commande</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{order.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                {order.payment_status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expédition</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{order.fulfillment_status}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Récapitulatif financier</CardTitle>
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
            <CardTitle className="text-sm font-medium">Changer le statut</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select onValueChange={set_next_status} value={next_status}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Sélectionner un statut" />
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
      </TabsContent>

      {/* ── Items ───────────────────────────────────── */}
      <TabsContent value="items">
        <Card>
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
        {adjustments.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ajustements</CardTitle>
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
          <CardHeader>
            <CardTitle className="text-sm font-medium">Adresse de livraison</CardTitle>
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
        {order.shipment_provider && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Transporteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{order.shipment_provider}</Badge>
                {order.shipment_reference && (
                  <span className="text-muted-foreground font-mono text-xs">
                    {order.shipment_reference}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── Payments ────────────────────────────────── */}
      <TabsContent value="payments">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Informations de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-36">Statut</span>
              <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                {order.payment_status}
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
      </TabsContent>

      {/* ── Timeline ────────────────────────────────── */}
      <TabsContent value="timeline">
        <div className="space-y-3">
          {status_events.map((ev, idx) => (
            <div key={ev.id} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-primary h-3 w-3 rounded-full" />
                {idx < status_events.length - 1 && <div className="bg-border mt-1 w-px flex-1" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2">
                  {ev.from_status && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {ev.from_status}
                      </Badge>
                      <span className="text-muted-foreground text-xs">→</span>
                    </>
                  )}
                  <Badge className="text-xs">{ev.to_status}</Badge>
                </div>
                {ev.note && <p className="text-muted-foreground mt-1 text-sm">{ev.note}</p>}
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDate(ev.created_at, {
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {status_events.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucun événement enregistré.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
