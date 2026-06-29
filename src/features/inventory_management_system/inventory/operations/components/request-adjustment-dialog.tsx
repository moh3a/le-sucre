"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("inventory_adjustments");
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
      toast.success(t("adjustment_created"));
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
      toast.error(t("fill_required"));
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
          {t("request_adjustment")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("request_adjustment_title")}</DialogTitle>
          <DialogDescription>
            {t("request_adjustment_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_sku">{t("sku_label")}</Label>
              <Input
                id="ia_sku"
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                placeholder={t("sku_id_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_warehouse">{t("warehouse_label")}</Label>
              <Input
                id="ia_warehouse"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder={t("default_placeholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ia_type">{t("type_label")}</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType} required>
              <SelectTrigger>
                <SelectValue placeholder={t("select_type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">{t("type_increase")}</SelectItem>
                <SelectItem value="decrease">{t("type_decrease")}</SelectItem>
                <SelectItem value="damage">{t("type_damage")}</SelectItem>
                <SelectItem value="loss">{t("type_loss")}</SelectItem>
                <SelectItem value="correction">{t("type_correction")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_quantity">{t("quantity_label")}</Label>
              <Input
                id="ia_quantity"
                type="number"
                value={quantityDelta}
                onChange={(e) => setQuantityDelta(e.target.value)}
                placeholder={t("delta_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_current">{t("current_stock_label")}</Label>
              <Input
                id="ia_current"
                type="number"
                value={currentOnHand}
                onChange={(e) => setCurrentOnHand(e.target.value)}
                placeholder={t("current_stock_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_expected">{t("expected_stock_label")}</Label>
              <Input
                id="ia_expected"
                type="number"
                value={expectedOnHand}
                onChange={(e) => setExpectedOnHand(e.target.value)}
                placeholder={t("expected_stock_placeholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ia_reason">{t("reason_label")}</Label>
            <Textarea
              id="ia_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reason_placeholder")}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("creating") : t("request")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
