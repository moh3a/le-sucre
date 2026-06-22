"use client";

import { useState } from "react";
import { ArrowLeftRight, PackageX, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  RETURN_REQUEST_TYPE_LABELS,
} from "../constants/status";
import type { OrderItemInfo } from "./types";

type CreateRequestDialogProps = {
  order_id: string;
  items: OrderItemInfo[];
  type: string;
  on_created: () => void;
};

export function CreateRequestDialog({
  order_id,
  items,
  type,
  on_created,
}: CreateRequestDialogProps) {
  const [open, set_open] = useState(false);
  const [reason, set_reason] = useState("");
  const [note, set_note] = useState("");

  const create_mutation = trpc.returns.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Demande créée avec succès");
      set_open(false);
      on_created();
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const type_label = RETURN_REQUEST_TYPE_LABELS[type] ?? type;

  function handle_submit() {
    if (!reason.trim()) {
      toast.error("Veuillez saisir un motif");
      return;
    }
    create_mutation.mutate({
      order_id,
      type: type as "return" | "replacement" | "failed_delivery",
      reason,
      customer_note: note || undefined,
      items: items.map((i) => ({
        sku_id: i.sku_id,
        product_name: i.product_name,
        sku_code: i.sku_code,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });
  }

  const button_label =
    type === "failed_delivery"
      ? "Livraison échouée"
      : type === "return"
        ? "Retour"
        : "Remplacement";

  const button_icon =
    type === "failed_delivery"
      ? <PackageX className="h-3 w-3" />
      : type === "return"
        ? <RotateCcw className="h-3 w-3" />
        : <ArrowLeftRight className="h-3 w-3" />;

  return (
    <QueryGuard mutation={create_mutation}>
    <Dialog open={open} onOpenChange={set_open}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={type === "failed_delivery" ? "destructive" : "outline"}
          className="gap-1"
        >
          {button_icon}
          {button_label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle demande de {type_label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            {type === "return"
              ? "Créez une demande de retour pour les articles sélectionnés."
              : type === "replacement"
                ? "Créez une demande de remplacement pour les articles défectueux ou incorrects."
                : "Marquez la livraison comme échouée et créez une demande de traitement."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border text-sm">
            <table className="w-full text-xs">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Produit</th>
                  <th className="px-3 py-2 text-left font-medium">SKU</th>
                  <th className="px-3 py-2 text-right font-medium">Qté</th>
                  <th className="px-3 py-2 text-right font-medium">Prix</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 font-mono">{item.sku_code}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.unit_price).toLocaleString("fr-FR")} DZD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motif *</label>
            <Textarea
              placeholder="Décrivez le motif de la demande..."
              value={reason}
              onChange={(e) => set_reason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Note interne (optionnelle)</label>
            <Textarea
              placeholder="Note pour l'équipe..."
              value={note}
              onChange={(e) => set_note(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => set_open(false)}>
            Annuler
          </Button>
          <Button
            onClick={handle_submit}
            disabled={create_mutation.isPending || !reason.trim()}
          >
            {create_mutation.isPending ? "Création..." : "Créer la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
