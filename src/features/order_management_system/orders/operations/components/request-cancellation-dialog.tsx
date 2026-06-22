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
import { Ban } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function RequestCancellationDialog() {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.orderRequestCancellation.useMutation({
    onSuccess: () => {
      toast.success("Demande d'annulation soumise");
      setOpen(false);
      reset();
      utils.operations.orderListCancellationRequests.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setReason("");
    setDescription("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      order_id: orderId,
      reason,
      description: description || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Ban className="mr-2 size-4" />
          Demander une annulation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demander une annulation de commande</DialogTitle>
          <DialogDescription>
            Soumettre une demande d&apos;annulation pour approbation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cn_order_id">Commande *</Label>
            <Input
              id="cn_order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ID de la commande"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cn_reason">Motif *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un motif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_request">Demande client</SelectItem>
                <SelectItem value="payment_issue">Problème de paiement</SelectItem>
                <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                <SelectItem value="fraud">Fraude</SelectItem>
                <SelectItem value="duplicate">Doublon</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cn_description">Description</Label>
            <Textarea
              id="cn_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails (optionnel)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Envoi..." : "Soumettre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
