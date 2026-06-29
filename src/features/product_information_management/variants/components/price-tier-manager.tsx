"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
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
import { Loader2, Plus, Trash2 } from "lucide-react";

const TIER_CHANNELS = (t: (key: string) => string) => [
  { value: "retail", label: t("tier_channel_retail") },
  { value: "wholesale", label: t("tier_channel_wholesale") },
] as const;

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
      setTierChannel("retail");
      setTierMinQty(1);
      setTierPrice("");
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePriceTier = trpc.variants.deleteSkuPriceTier.useMutation({
    onSuccess: () => {
      utils.variants.getSku.invalidate({ id: skuId });
      toast.success(t("tier_deleted"));
    },
    onError: (err) => toast.error(err.message),
  });

  const upsertRule = trpc.variants.upsertWholesaleRule.useMutation({
    onSuccess: () => {
      utils.variants.getSku.invalidate({ id: skuId });
      toast.success(t("wholesale_rule_added"));
      setRuleMinQty(1);
      setRuleDiscount("");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteRule = trpc.variants.deleteWholesaleRule.useMutation({
    onSuccess: () => {
      utils.variants.getSku.invalidate({ id: skuId });
      toast.success(t("wholesale_rule_deleted"));
    },
    onError: (err) => toast.error(err.message),
  });

  // New price tier form
  const [tierChannel, setTierChannel] = React.useState<"retail" | "wholesale">("retail");
  const [tierMinQty, setTierMinQty] = React.useState(1);
  const [tierPrice, setTierPrice] = React.useState("");

  // New wholesale rule form
  const [ruleMinQty, setRuleMinQty] = React.useState(1);
  const [ruleDiscount, setRuleDiscount] = React.useState("");

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

  function handleDeleteTier(channel: string, minQty: number) {
    deletePriceTier.mutate({
      sku_id: skuId,
      channel: channel as "retail" | "wholesale",
      min_quantity: minQty,
    });
  }

  function handleAddRule() {
    const discount = parseFloat(ruleDiscount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast.error(t("tier_discount_invalid"));
      return;
    }
    upsertRule.mutate({
      sku_id: skuId,
      min_quantity: ruleMinQty,
      discount_percent: discount,
      is_active: true,
    });
  }

  function handleDeleteRule(ruleId: string) {
    deleteRule.mutate({ id: ruleId });
  }

  const sku = data?.sku;
  const tiers = data?.tiers ?? [];
  const wholesaleRules = data?.wholesale_rules ?? [];

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
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Existing Price Tiers */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t("tier_section_title")}</h3>
              {tiers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("tier_empty")}</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {tiers.map((tier, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{tier.channel}</span>
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
                        onClick={() => handleDeleteTier(tier.channel, tier.min_quantity)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Price Tier */}
            <div className="rounded-lg border p-3 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
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
                      {TIER_CHANNELS(t).map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
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

            {/* Existing Wholesale Rules */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t("wholesale_section_title")}</h3>
              {wholesaleRules.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("wholesale_empty")}</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {wholesaleRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <span className="font-mono">{t("tier_min_qty_label", { qty: rule.min_quantity })}</span>
                        {rule.discount_percent && (
                          <span className="ml-2 text-emerald-600">
                            -{Number(rule.discount_percent).toFixed(1)}%
                          </span>
                        )}
                        {rule.price && (
                          <span className="ml-2 font-mono">
                            {Number(rule.price).toLocaleString("fr-FR")} {rule.currency}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-red-500"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Wholesale Rule */}
            <div className="rounded-lg border p-3 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                {t("wholesale_add_rule")}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">{t("tier_min_qty_column")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={ruleMinQty}
                    onChange={(e) => setRuleMinQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("wholesale_discount_label")}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    placeholder="0.0"
                    value={ruleDiscount}
                    onChange={(e) => setRuleDiscount(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    className="h-8 w-full"
                    onClick={handleAddRule}
                    disabled={upsertRule.isPending}
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
    </Dialog>
  );
}
