"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, FileText } from "lucide-react";

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
import { trpc } from "@/components/providers/app-providers";

export function GenerateInvoiceDialog() {
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState("");

  const utils = trpc.useUtils();

  const generate = trpc.invoices.generate_invoice.useMutation({
    onSuccess: () => {
      toast.success("Facture générée avec succès");
      setOpen(false);
      setOrderId("");
      void utils.invoices.list_invoices.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    generate.mutate({ order_id });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Générer une facture
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Générer une facture</DialogTitle>
          <DialogDescription>
            Générer une facture à partir d&apos;une commande existante.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ID Commande</Label>
            <Input value={order_id} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={generate.isPending}>
            <FileText />
            Générer la facture
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
