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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function RequestRefundDialog() {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [cancellationRequestId, setCancellationRequestId] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.paymentRequestRefund.useMutation({
    onSuccess: () => {
      toast.success("Demande de remboursement créée");
      setOpen(false);
      reset();
      utils.operations.paymentListRefundRequests.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setAmount("");
    setReason("");
    setCancellationRequestId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !amount || !reason) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      order_id: orderId,
      amount: Number(amount),
      reason,
      cancellation_request_id: cancellationRequestId || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Plus className="mr-2 size-4" />
          Demander un remboursement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demander un remboursement</DialogTitle>
          <DialogDescription>
            Créer une nouvelle demande de remboursement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rf_order_id">Commande *</Label>
              <Input
                id="rf_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ID de la commande"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rf_amount">Montant *</Label>
              <Input
                id="rf_amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rf_reason">Motif *</Label>
            <Textarea
              id="rf_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison du remboursement"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rf_cancellation_id">ID demande d'annulation</Label>
            <Input
              id="rf_cancellation_id"
              value={cancellationRequestId}
              onChange={(e) => setCancellationRequestId(e.target.value)}
              placeholder="Optionnel, si lié à une annulation"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Création..." : "Demander"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
