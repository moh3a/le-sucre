"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { InventoryStockRow } from "../repositories/inventory-admin.repository";

type Props = {
  row: InventoryStockRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventoryStockDialog({ row, open, onOpenChange }: Props) {
  const t = useTranslations("inventory");
  const utils = trpc.useUtils();
  const [receive_qty, set_receive_qty] = useState("");
  const [adjust_qty, set_adjust_qty] = useState("");

  const receive = trpc.inventory.receiveStock.useMutation({
    onSuccess: async () => {
      toast.success(t("stock_received"));
      await utils.inventory.adminListStock.invalidate();
      await utils.inventory.adminStats.invalidate();
      await utils.inventory.adminCharts.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const adjust = trpc.inventory.adjustStock.useMutation({
    onSuccess: async () => {
      toast.success(t("stock_adjusted"));
      await utils.inventory.adminListStock.invalidate();
      await utils.inventory.adminStats.invalidate();
      await utils.inventory.adminCharts.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const is_low = row.quantity_on_hand > 0 && row.quantity_on_hand <= 5;

  return (
    <QueryGuard mutation={receive}>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adjust_stock_title")}</DialogTitle>
          <DialogDescription>
            SKU: <span className="font-mono font-medium">{row.sku_code}</span>
            {" — "}
            {row.product_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{t("on_hand")}: {row.quantity_on_hand}</Badge>
            <Badge variant="secondary">{t("reserved")}: {row.quantity_reserved}</Badge>
            <Badge variant={row.stock_available === 0 ? "destructive" : is_low ? "secondary" : "default"}>
              {t("available")}: {row.stock_available}
            </Badge>
            <Badge variant="outline">{t("warehouse")}: {row.warehouse_id}</Badge>
          </div>

          <div className="grid gap-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receive">{t("receive_quantity")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="receive"
                    type="number"
                    min={1}
                    value={receive_qty}
                    onChange={(e) => set_receive_qty(e.target.value)}
                    placeholder={t("quantity_placeholder")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={receive.isPending || !receive_qty}
                    onClick={() =>
                      receive.mutate({
                        sku_id: row.sku_id,
                        warehouse_id: row.warehouse_id,
                        quantity: Number(receive_qty),
                      })
                    }
                  >
                    {t("ok")}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjust">{t("adjust_stock")} (+/-)</Label>
                <div className="flex gap-2">
                  <Input
                    id="adjust"
                    type="number"
                    value={adjust_qty}
                    onChange={(e) => set_adjust_qty(e.target.value)}
                    placeholder={t("delta_placeholder")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={adjust.isPending || !adjust_qty}
                    onClick={() =>
                      adjust.mutate({
                        sku_id: row.sku_id,
                        warehouse_id: row.warehouse_id,
                        quantity_delta: Number(adjust_qty),
                        reference_type: "manual_adjust",
                      })
                    }
                  >
                    {t("ok")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
