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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function RequestAdjustmentDialog() {
  const [open, setOpen] = useState(false);
  const [skuId, setSkuId] = useState("");
  const [warehouseId, setWarehouseId] = useState("default");
  const [adjustmentType, setAdjustmentType] = useState("");
  const [quantityDelta, setQuantityDelta] = useState("");
  const [currentOnHand, setCurrentOnHand] = useState("");
  const [expectedOnHand, setExpectedOnHand] = useState("");
  const [reason, setReason] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.inventoryRequestAdjustment.useMutation({
    onSuccess: () => {
      toast.success("Demande d'ajustement créée");
      setOpen(false);
      reset();
      utils.operations.inventoryListAdjustmentRequests.invalidate();
      utils.operations.inventoryAdjustmentStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setSkuId("");
    setWarehouseId("default");
    setAdjustmentType("");
    setQuantityDelta("");
    setCurrentOnHand("");
    setExpectedOnHand("");
    setReason("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!skuId || !adjustmentType || !quantityDelta || !reason) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      sku_id: skuId,
      warehouse_id: warehouseId,
      adjustment_type: adjustmentType as "increase" | "decrease" | "damage" | "loss" | "correction",
      quantity_delta: Number(quantityDelta),
      current_on_hand: Number(currentOnHand),
      expected_on_hand: Number(expectedOnHand),
      reason,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Demander un ajustement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Demander un ajustement de stock</DialogTitle>
          <DialogDescription>
            Créer une demande d'ajustement d'inventaire pour approbation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_sku">SKU *</Label>
              <Input
                id="ia_sku"
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                placeholder="ID du SKU"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_warehouse">Entrepôt</Label>
              <Input
                id="ia_warehouse"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder="default"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ia_type">Type d'ajustement *</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Augmentation</SelectItem>
                <SelectItem value="decrease">Diminution</SelectItem>
                <SelectItem value="damage">Dommage</SelectItem>
                <SelectItem value="loss">Perte</SelectItem>
                <SelectItem value="correction">Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_quantity">Quantité *</Label>
              <Input
                id="ia_quantity"
                type="number"
                value={quantityDelta}
                onChange={(e) => setQuantityDelta(e.target.value)}
                placeholder="Delta"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_current">Stock actuel</Label>
              <Input
                id="ia_current"
                type="number"
                value={currentOnHand}
                onChange={(e) => setCurrentOnHand(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_expected">Stock attendu</Label>
              <Input
                id="ia_expected"
                type="number"
                value={expectedOnHand}
                onChange={(e) => setExpectedOnHand(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ia_reason">Motif *</Label>
            <Textarea
              id="ia_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison de l'ajustement"
              required
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
