"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Package, Truck } from "lucide-react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/console/stats-grid";

type ProductInventoryPanelProps = {
  product_id: string;
};

export function ProductInventoryPanel({ product_id }: ProductInventoryPanelProps) {
  const t = useTranslations("inventory");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.inventory.listByProduct.useQuery({
    product_id,
    warehouse_id: "default",
  });

  const set_stock = trpc.inventory.setStock.useMutation({
    onSuccess: async () => {
      await utils.inventory.listByProduct.invalidate({ product_id, warehouse_id: "default" });
      await utils.variants.listSkus.invalidate({ product_id });
      toast.success(t("stock_updated"));
    },
    onError: (err) => toast.error(err.message),
  });

  const receive = trpc.inventory.receiveStock.useMutation({
    onSuccess: async () => {
      await utils.inventory.listByProduct.invalidate({ product_id, warehouse_id: "default" });
      await utils.variants.listSkus.invalidate({ product_id });
      toast.success(t("stock_received"));
    },
    onError: (err) => toast.error(err.message),
  });

  const [drafts, set_drafts] = useState<Record<string, { set_qty: string; receive_qty: string }>>(
    {},
  );

  function draft_for(sku_id: string) {
    return drafts[sku_id] ?? { set_qty: "", receive_qty: "" };
  }

  const items = data?.items ?? [];

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<p className="text-muted-foreground text-sm">{t("loading")}</p>}
    >
      <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: t("sku_count"),
              value: data?.items.length ?? 0,
              icon: Package,
              color: "info",
            },
            {
              label: t("total_available"),
              value: data?.items.reduce((sum, item) => sum + item.stock_available, 0) ?? 0,
              icon: Package,
              color: "info",
            },
            {
              label: t("total_on_hand"),
              value: data?.items.reduce((sum, item) => sum + item.quantity_on_hand, 0) ?? 0,
              icon: Package,
              color: "success",
            },
            {
              label: t("total_reserved"),
              value: data?.items.reduce((sum, item) => sum + item.quantity_reserved, 0) ?? 0,
              icon: Truck,
              color: "default",
            },
          ]}
        />
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((row) => (
              <li key={row.sku_id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm">{row.sku_code}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {t("on_hand")}: {row.quantity_on_hand}
                      </Badge>
                      <Badge variant="secondary">
                        {t("reserved")}: {row.quantity_reserved}
                      </Badge>
                      <Badge>
                        {t("available")}: {row.stock_available}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Field>
                    <FieldLabel>{t("set_quantity")}</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={draft_for(row.sku_id).set_qty}
                        onChange={(e) =>
                          set_drafts((d) => ({
                            ...d,
                            [row.sku_id]: { ...draft_for(row.sku_id), set_qty: e.target.value },
                          }))
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={set_stock.isPending}
                        onClick={() =>
                          set_stock.mutate({
                            sku_id: row.sku_id,
                            warehouse_id: "default",
                            quantity_on_hand: Number(draft_for(row.sku_id).set_qty),
                          })
                        }
                      >
                        {t("apply")}
                      </Button>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel>{t("receive_quantity")}</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={draft_for(row.sku_id).receive_qty}
                        onChange={(e) =>
                          set_drafts((d) => ({
                            ...d,
                            [row.sku_id]: {
                              ...draft_for(row.sku_id),
                              receive_qty: e.target.value,
                            },
                          }))
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={receive.isPending}
                        onClick={() =>
                          receive.mutate({
                            sku_id: row.sku_id,
                            warehouse_id: "default",
                            quantity: Number(draft_for(row.sku_id).receive_qty),
                          })
                        }
                      >
                        {t("receive")}
                      </Button>
                    </div>
                  </Field>
                </div>

                <Collapsible className="mt-4">
                  <CollapsibleTrigger className="text-sm underline">
                    {t("movements")}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <SkuMovements sku_id={row.sku_id} />
                  </CollapsibleContent>
                </Collapsible>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
    </QueryGuard>
  );
}

function SkuMovements({ sku_id }: { sku_id: string }) {
  const t = useTranslations("inventory");
  const { data } = trpc.inventory.listMovements.useQuery({
    sku_id,
    warehouse_id: "default",
    limit: 20,
  });

  if (!data?.movements.length) {
    return <p className="text-muted-foreground text-xs">{t("no_movements")}</p>;
  }

  return (
    <ul className="space-y-1 text-xs">
      {data.movements.map((m) => (
        <li key={m.id} className="flex justify-between gap-2 border-b py-1">
          <span>
            {m.movement_type} ({m.quantity_delta >= 0 ? "+" : ""}
            {m.quantity_delta})
          </span>
          <span className="text-muted-foreground">{m.created_at}</span>
        </li>
      ))}
    </ul>
  );
}
