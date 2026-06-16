"use client";

import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
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
  const utils = trpc.useUtils();
  const [receive_qty, set_receive_qty] = useState("");
  const [adjust_qty, set_adjust_qty] = useState("");

  const receive = trpc.inventory.receiveStock.useMutation({
    onSuccess: async () => {
      toast.success("Stock réceptionné avec succès");
      await utils.inventory.adminListStock.invalidate();
      await utils.inventory.adminStats.invalidate();
      await utils.inventory.adminCharts.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const adjust = trpc.inventory.adjustStock.useMutation({
    onSuccess: async () => {
      toast.success("Stock ajusté avec succès");
      await utils.inventory.adminListStock.invalidate();
      await utils.inventory.adminStats.invalidate();
      await utils.inventory.adminCharts.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const is_low = row.quantity_on_hand > 0 && row.quantity_on_hand <= 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuster le stock</DialogTitle>
          <DialogDescription>
            SKU: <span className="font-mono font-medium">{row.sku_code}</span>
            {" — "}
            {row.product_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">En stock: {row.quantity_on_hand}</Badge>
            <Badge variant="secondary">Réservé: {row.quantity_reserved}</Badge>
            <Badge variant={row.stock_available === 0 ? "destructive" : is_low ? "secondary" : "default"}>
              Disponible: {row.stock_available}
            </Badge>
            <Badge variant="outline">Entrepôt: {row.warehouse_id}</Badge>
          </div>

          <div className="grid gap-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receive">Réceptionner</Label>
                <div className="flex gap-2">
                  <Input
                    id="receive"
                    type="number"
                    min={1}
                    value={receive_qty}
                    onChange={(e) => set_receive_qty(e.target.value)}
                    placeholder="Qté"
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
                    OK
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjust">Ajuster (+/-)</Label>
                <div className="flex gap-2">
                  <Input
                    id="adjust"
                    type="number"
                    value={adjust_qty}
                    onChange={(e) => set_adjust_qty(e.target.value)}
                    placeholder="Delta"
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
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
