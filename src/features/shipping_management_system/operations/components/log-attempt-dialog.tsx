"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Truck } from "lucide-react";

type LogAttemptDialogProps = {
  order_id?: string;
  shipment_id?: string;
};

export function LogAttemptDialog({ order_id, shipment_id }: LogAttemptDialogProps) {
  const [open, setOpen] = useState(false);
  const [shipmentId, setShipmentId] = useState(shipment_id ?? "");
  const [orderId, setOrderId] = useState(order_id ?? "");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [nextAttemptAt, setNextAttemptAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.deliveryLogAttempt.useMutation({
    onSuccess: () => {
      toast.success("Tentative de livraison enregistrée");
      setOpen(false);
      reset();
      utils.operations.deliveryListAttempts.invalidate();
      utils.operations.deliveryGetStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setShipmentId(shipment_id ?? "");
    setOrderId(order_id ?? "");
    setStatus("");
    setDescription("");
    setNextAttemptAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shipmentId || !orderId || !status) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    mutation.mutate({
      shipment_id: shipmentId,
      order_id: orderId,
      status: status as "successful" | "failed" | "customer_unavailable" | "wrong_address" | "refused" | "cancelled",
      description: description || undefined,
      next_attempt_at: nextAttemptAt || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Truck className="mr-2 size-4" />
          Enregistrer une tentative
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enregistrer une tentative de livraison</DialogTitle>
          <DialogDescription>
            Saisissez les informations de la tentative de livraison.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipment_id">Expédition *</Label>
              <Input
                id="shipment_id"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                placeholder="ID de l'expédition"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_id">Commande *</Label>
              <Input
                id="order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ID de la commande"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="successful">Livré</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
                <SelectItem value="customer_unavailable">Client absent</SelectItem>
                <SelectItem value="wrong_address">Mauvaise adresse</SelectItem>
                <SelectItem value="refused">Refusé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de la tentative (optionnel)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_attempt_at">Prochaine tentative</Label>
            <Input
              id="next_attempt_at"
              type="datetime-local"
              value={nextAttemptAt}
              onChange={(e) => setNextAttemptAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
