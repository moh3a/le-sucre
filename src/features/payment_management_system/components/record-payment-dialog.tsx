"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";

const PROVIDERS = [
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "chargily", label: "Chargily" },
  { value: "satim", label: "SATIM" },
  { value: "cib", label: "CIB" },
  { value: "cod", label: "Contre-remboursement" },
  { value: "bank_transfer", label: "Virement bancaire" },
] as const;

export function RecordPaymentDialog() {
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState("");
  const [provider, setProvider] = React.useState("stripe");
  const [amount, setAmount] = React.useState("");

  const utils = trpc.useUtils();

  const process = trpc.payments.adminProcess.useMutation({
    onSuccess: () => {
      toast.success("Paiement enregistré avec succès");
      setOpen(false);
      setOrderId("");
      setProvider("stripe");
      setAmount("");
      void utils.payments.adminList.invalidate();
      void utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    process.mutate({
      order_id,
      provider: provider as never,
      amount: Number(amount),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Enregistrer un paiement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Enregistrer un paiement manuel pour une commande.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ID Commande</Label>
            <Input value={order_id} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Montant (DZD)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Moyen de paiement</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={process.isPending}>
            <CreditCard />
            Enregistrer le paiement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
