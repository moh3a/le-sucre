"use client";

import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
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
import { Separator } from "@/components/ui/separator";
import {
  ORDER_LABELS,
  PAYMENT_LABELS,
  FULFILLMENT_LABELS,
  PAYMENT_BADGE,
  FULFILLMENT_BADGE,
  STATUS_BADGE,
} from "../constants/order-status";
import { NotesCard } from "./notes-card";

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "En attente de paiement" },
  { value: "paid", label: "Payé" },
  { value: "processing", label: "En cours" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "failed_delivery", label: "Livraison échouée" },
  { value: "cancelled", label: "Annulée" },
  { value: "refunded", label: "Remboursée" },
] as const;

type GeneralTabProps = {
  order: Record<string, unknown> & {
    id: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    subtotal: string;
    discount_total: string;
    tax_total: string;
    shipping_total: string;
    grand_total: string;
    assigned_operator_id: string | null;
    assigned_delivery_person_id: string | null;
    notes: string | null;
  };
  on_update: () => void;
};

export function GeneralTab({ order, on_update }: GeneralTabProps) {
  const transition = trpc.orders.adminTransition.useMutation({ onSuccess: () => on_update() });
  const [next_status, set_next_status] = useState<string>("");

  const { data: operators_data, isLoading: operators_loading } =
    trpc.adminAuth.listUsersByRole.useQuery({ role: "operator" });
  const { data: deliverers_data, isLoading: deliverers_loading } =
    trpc.adminAuth.listUsersByRole.useQuery({ role: "delivery_person" });

  const assign_operator = trpc.orders.adminAssignOperator.useMutation({
    onSuccess: () => {
      on_update();
      toast.success("Opérateur assigné avec succès");
    },
    onError: (err) => toast.error(`Erreur d'affectation: ${err.message}`),
  });

  const assign_delivery = trpc.orders.adminAssignDeliveryPerson.useMutation({
    onSuccess: () => {
      on_update();
      toast.success("Livreur assigné avec succès");
    },
    onError: (err) => toast.error(`Erreur d'affectation: ${err.message}`),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Statut commande</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={STATUS_BADGE[order.status] ?? "secondary"}>
              {ORDER_LABELS[order.status] ?? order.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={PAYMENT_BADGE[order.payment_status] ?? "outline"}>
              {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Expédition</CardTitle>
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
                  <SelectValue placeholder="Sélectionner un opérateur" />
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
                  <SelectValue placeholder="Sélectionner un livreur" />
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

      <NotesCard order_id={order.id} initial_notes={order.notes ?? ""} on_saved={on_update} />
    </div>
  );
}
