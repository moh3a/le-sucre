"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, RotateCcw } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";

export function CreateRefundDialog() {
  const [open, setOpen] = React.useState(false);
  const [transaction_id, setTransactionId] = React.useState("");
  const [type, setType] = React.useState("full");
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");

  const utils = trpc.useUtils();

  const create = trpc.payments.adminCreateRefund.useMutation({
    onSuccess: () => {
      toast.success("Remboursement créé avec succès");
      setOpen(false);
      setTransactionId("");
      setType("full");
      setAmount("");
      setReason("");
      void utils.payments.adminListRefunds.invalidate();
      void utils.payments.adminRefundStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      transaction_id,
      type: type as "full" | "partial" | "sku_level",
      amount: amount ? Number(amount) : undefined,
      reason: reason || undefined,
      require_approval: false,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau remboursement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un remboursement</DialogTitle>
          <DialogDescription>
            Initier un remboursement pour une transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ID Transaction</Label>
            <Input value={transaction_id} onChange={(e) => setTransactionId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Remboursement total</SelectItem>
                <SelectItem value="partial">Remboursement partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type !== "full" && (
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
          )}
          <div className="space-y-2">
            <Label>Raison (optionnelle)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            <RotateCcw />
            Créer le remboursement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
