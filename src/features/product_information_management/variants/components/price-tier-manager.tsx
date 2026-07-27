"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PriceTierManagerProps = {
  skuId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PriceTierManager({ skuId, open, onOpenChange }: PriceTierManagerProps) {
  const t = useTranslations("variants");
  const utils = trpc.useUtils();
  const { data, isFetching } = trpc.variants.getSku.useQuery({ id: skuId }, { enabled: open });

  const setPriceTier = trpc.variants.setSkuPriceTier.useMutation({
    onSuccess: () => {
      utils.variants.getSku.invalidate({ id: skuId });
      toast.success(t("tier_saved"));
      setTierMinQty(1);
      setTierPrice("");
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePriceTier = trpc.variants.deleteSkuPriceTier.useMutation({
    onSuccess: () => {
      utils.variants.getSku.invalidate({ id: skuId });
      set_delete_tier_target(null);
      toast.success(t("tier_deleted"));
    },
    onError: (err) => toast.error(err.message),
  });

  const [tierChannel, setTierChannel] = React.useState<"retail" | "wholesale">("retail");
  const [tierMinQty, setTierMinQty] = React.useState(1);
  const [tierPrice, setTierPrice] = React.useState("");

  const [delete_tier_target, set_delete_tier_target] = React.useState<{
    channel: string;
    minQty: number;
  } | null>(null);

  function handleAddTier() {
    const price = parseFloat(tierPrice);
    if (isNaN(price) || price <= 0) {
      toast.error(t("tier_price_invalid"));
      return;
    }
    setPriceTier.mutate({
      sku_id: skuId,
      channel: tierChannel,
      min_quantity: tierMinQty,
      price,
    });
  }

  const sku = data?.sku;
  const tiers = data?.tiers ?? [];
  const retailTiers = tiers.filter((t) => t.channel === "retail");
  const wholesaleTiers = tiers.filter((t) => t.channel === "wholesale");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("tier_dialog_title")}</DialogTitle>
          <DialogDescription>
            {t("tier_dialog_description", { sku: sku?.sku_code ?? skuId })}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="retail">
              <TabsList className="w-full">
                <TabsTrigger value="retail" className="flex-1">{t("tier_channel_retail")}</TabsTrigger>
                <TabsTrigger value="wholesale" className="flex-1">{t("tier_channel_wholesale")}</TabsTrigger>
              </TabsList>

              <TabsContent value="retail" className="space-y-4">
                <TierList
                  tiers={retailTiers}
                  emptyMessage={t("tier_empty")}
                  onDelete={(channel, minQty) => set_delete_tier_target({ channel, minQty })}
                  isDeleting={deletePriceTier.isPending}
                />
              </TabsContent>

              <TabsContent value="wholesale" className="space-y-4">
                <TierList
                  tiers={wholesaleTiers}
                  emptyMessage={t("tier_empty")}
                  onDelete={(channel, minQty) => set_delete_tier_target({ channel, minQty })}
                  isDeleting={deletePriceTier.isPending}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-3 rounded-lg border p-3">
              <h4 className="text-muted-foreground text-xs font-semibold uppercase">
                {t("tier_add")}
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs">{t("tier_channel_column")}</Label>
                  <Select
                    value={tierChannel}
                    onValueChange={(v) => setTierChannel(v as "retail" | "wholesale")}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">{t("tier_channel_retail")}</SelectItem>
                      <SelectItem value="wholesale">{t("tier_channel_wholesale")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t("tier_min_qty_column")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={tierMinQty}
                    onChange={(e) => setTierMinQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("tier_price_column")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    value={tierPrice}
                    onChange={(e) => setTierPrice(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    className="h-8 w-full"
                    onClick={handleAddTier}
                    disabled={setPriceTier.isPending}
                  >
                    <Plus className="mr-1 size-3.5" />
                    {t("tier_add_button")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <AlertDialog
        open={delete_tier_target !== null}
        onOpenChange={(open) => {
          if (!open) set_delete_tier_target(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_tier_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("delete_tier_description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePriceTier.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePriceTier.isPending}
              onClick={() => {
                if (delete_tier_target) {
                  deletePriceTier.mutate({
                    sku_id: skuId,
                    channel: delete_tier_target.channel as "retail" | "wholesale",
                    min_quantity: delete_tier_target.minQty,
                  });
                }
              }}
            >
              {deletePriceTier.isPending ? t("deleting") : t("confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

function TierList({
  tiers,
  emptyMessage,
  onDelete,
  isDeleting,
}: {
  tiers: Array<{ channel: string; min_quantity: number; price: string; currency: string }>;
  emptyMessage: string;
  onDelete: (channel: string, minQty: number) => void;
  isDeleting: boolean;
}) {
  const t = useTranslations("variants");

  if (tiers.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y rounded-lg border">
      {tiers.map((tier, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
          <div>
            <span className="text-muted-foreground ml-2">
              {t("tier_min_qty_label", { qty: tier.min_quantity })}
            </span>
            <span className="ml-2 font-mono">
              {Number(tier.price).toLocaleString("fr-FR")} {tier.currency}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-red-500"
            disabled={isDeleting}
            onClick={() => onDelete(tier.channel, tier.min_quantity)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
