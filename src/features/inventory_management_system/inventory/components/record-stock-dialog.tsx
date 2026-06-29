"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, PackagePlus } from "lucide-react";

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

export function RecordStockDialog() {
  const t = useTranslations("inventory");
  const [open, setOpen] = React.useState(false);
  const [sku_id, setSkuId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [warehouse_id, setWarehouseId] = React.useState("");

  const utils = trpc.useUtils();

  const receive = trpc.inventory.receiveStock.useMutation({
    onSuccess: () => {
      toast.success(t("stock_recorded"));
      setOpen(false);
      setSkuId("");
      setQuantity("1");
      setWarehouseId("");
      void utils.inventory.adminListStock.invalidate();
      void utils.inventory.adminStats.invalidate();
      void utils.inventory.listMovements.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    receive.mutate({
      sku_id,
      quantity: Number(quantity),
      warehouse_id: warehouse_id || undefined,
    });
  }

  return (
    <QueryGuard mutation={receive}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("record_stock_title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("record_stock_title")}</DialogTitle>
          <DialogDescription>
            {t("record_stock_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("sku_id_label")}</Label>
            <Input value={sku_id} onChange={(e) => setSkuId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("quantity_label")}</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("warehouse_optional")}</Label>
            <Input value={warehouse_id} onChange={(e) => setWarehouseId(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={receive.isPending}>
            <PackagePlus />
            {t("receive")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
