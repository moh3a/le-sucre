"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Package } from "lucide-react";

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

const PROVIDERS = ["yalidine", "dhl", "fedex", "ups", "ems"] as const;

export function CreateShipmentDialog() {
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState("");
  const [provider, setProvider] = React.useState<string>("yalidine");
  const [weight_kg, setWeightKg] = React.useState("1");

  const utils = trpc.useUtils();

  const create = trpc.shipping.create.useMutation({
    onSuccess: () => {
      toast.success("Expédition créée avec succès");
      setOpen(false);
      setOrderId("");
      setProvider("yalidine");
      setWeightKg("1");
      void utils.shipping.adminList.invalidate();
      void utils.shipping.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      order_id,
      provider: provider as "yalidine" | "dhl" | "fedex" | "ups" | "ems",
      weight_kg: Number(weight_kg),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouvelle expédition
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une expédition</DialogTitle>
          <DialogDescription>
            Créer une nouvelle expédition pour une commande.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ID Commande</Label>
            <Input value={order_id} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Transporteur</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Poids (kg)</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={weight_kg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            <Package />
            Créer l&apos;expédition
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
