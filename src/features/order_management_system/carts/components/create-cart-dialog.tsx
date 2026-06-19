"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, ShoppingBag } from "lucide-react";

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

export function CreateCartDialog() {
  const [open, setOpen] = React.useState(false);
  const [cart_id, setCartId] = React.useState("");
  const [sku_id, setSkuId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");

  const utils = trpc.useUtils();

  const add = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Article ajouté au panier");
      setOpen(false);
      setCartId("");
      setSkuId("");
      setQuantity("1");
      void utils.cart.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    add.mutate({
      cart_id,
      sku_id,
      quantity: Number(quantity),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau panier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un panier</DialogTitle>
          <DialogDescription>
            Ajouter un article à un panier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ID Panier</Label>
            <Input value={cart_id} onChange={(e) => setCartId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>SKU ID</Label>
            <Input value={sku_id} onChange={(e) => setSkuId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={add.isPending}>
            <ShoppingBag />
            Ajouter au panier
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
