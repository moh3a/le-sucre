"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { PackageOpen } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  PreorderSettingsForm,
  type PreorderSettingsDefaults,
} from "./preorder-settings-form";

export function ProductPreordersPanel({ product_id }: { product_id: string }) {
  const t = useTranslations("preorders");

  const skus_query = trpc.variants.listSkus.useQuery({ product_id });
  const settings_query = trpc.preorders.getSettingsByProduct.useQuery({ product_id });

  const settings_data = settings_query.data;
  const settings_by_sku = useMemo(() => {
    const map = new Map<string, NonNullable<typeof settings_data>[number]>();
    for (const s of settings_data ?? []) map.set(s.sku_id, s);
    return map;
  }, [settings_data]);

  const skus = skus_query.data?.items ?? [];

  if (skus_query.isLoading || settings_query.isLoading) {
    return <p className="text-muted-foreground text-sm">{t("loading")}</p>;
  }

  if (skus.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("no_skus")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{t("product_tab_title")}</h3>
        <p className="text-muted-foreground text-sm">{t("product_tab_desc")}</p>
      </div>

      {skus.map((sku) => {
        const settings = settings_by_sku.get(sku.sku_id);
        const defaults: PreorderSettingsDefaults = settings
          ? {
              is_preorder_enabled: settings.is_preorder_enabled,
              allow_backorder: settings.allow_backorder,
              max_preorder_qty: settings.max_preorder_qty,
              estimated_available_at: settings.estimated_available_at,
              deposit_percent: Number(settings.deposit_percent ?? 100),
              lead_time_days: settings.lead_time_days,
              is_active: settings.is_active,
            }
          : null;

        return (
          <Card key={sku.sku_id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="font-mono text-sm">{sku.sku_code}</CardTitle>
                <div className="flex items-center gap-2">
                  {settings && (
                    <Badge variant="outline">
                      {t("sold")}: {settings.preorder_sold}
                    </Badge>
                  )}
                  {settings?.is_preorder_enabled ? (
                    <Badge>{t("preorder_badge")}</Badge>
                  ) : settings?.allow_backorder ? (
                    <Badge variant="outline">{t("backorder_badge")}</Badge>
                  ) : (
                    <Badge variant="secondary">{t("not_configured")}</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{t("settings_for_sku")}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <PreorderSettingsForm sku_id={sku.sku_id} defaults={defaults} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
