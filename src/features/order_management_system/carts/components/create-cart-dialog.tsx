"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
import { QueryGuard } from "@/components/query-guard";

export function CreateCartDialog() {
  const t = useTranslations("carts");
  const [open, setOpen] = React.useState(false);
  const [cart_id, setCartId] = React.useState("");
  const [sku_id, setSkuId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");

  const utils = trpc.useUtils();

  const add = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success(t("item_added"));
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
    <QueryGuard mutation={add}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("new_cart_button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create_cart_title")}</DialogTitle>
          <DialogDescription>
            {t("create_cart_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("cart_id")}</Label>
            <Input value={cart_id} onChange={(e) => setCartId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("sku_id")}</Label>
            <Input value={sku_id} onChange={(e) => setSkuId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("quantity")}</Label>
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
            {t("add_to_cart_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
