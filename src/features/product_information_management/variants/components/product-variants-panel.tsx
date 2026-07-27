"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { VariantPropertyEditor } from "./variant-property-editor";
import { SkuTable } from "./sku-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const inner_tab_schema = z.enum(["properties", "skus"]);

type ProductVariantsPanelProps = {
  product_id: string;
  product_sku: string;
  currency: string;
  has_variants: boolean;
};

export function ProductVariantsPanel({
  product_id,
  product_sku,
  currency,
  has_variants,
}: ProductVariantsPanelProps) {
  const t = useTranslations("variants");
  const router = useRouter();
  const searchParams = useSearchParams();

  const price_range_query = trpc.variants.getPriceRange.useQuery({ product_id });
  const { data: price_range } = price_range_query;

  const parsed = inner_tab_schema.safeParse(searchParams.get("variant_tab"));
  const active_tab = parsed.success ? parsed.data : "properties";

  const on_tab_change = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant_tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <QueryGuard query={price_range_query}>
      <Card>
        <CardHeader className="flex flex-row flex-wrap justify-between gap-4">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
            {price_range?.retail?.min_price != null && price_range?.retail?.max_price != null && (
              <p className="mt-2 text-sm">
                {t("price_range_value", {
                  min: price_range.retail.min_price,
                  max: price_range.retail.max_price,
                  currency: price_range.retail.currency ?? currency,
                })}
              </p>
            )}
            {price_range?.wholesale?.min_price != null && price_range?.wholesale?.max_price != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("price_range_value", {
                  min: price_range.wholesale.min_price,
                  max: price_range.wholesale.max_price,
                  currency: price_range.wholesale.currency ?? currency,
                })}{" "}
                ({t("tier_channel_wholesale")})
              </p>
            )}
          </div>
          <div>
            <Badge variant={has_variants ? "outline" : "destructive"}>
              {has_variants ? <Check /> : <X />}
              <span>{t("enable_variants")}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={active_tab} onValueChange={on_tab_change} className="space-y-6">
            <TabsList>
              <TabsTrigger value="properties">{t("section_properties")}</TabsTrigger>
              <TabsTrigger value="skus">{t("section_skus")}</TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
              <VariantPropertyEditor product_id={product_id} />
            </TabsContent>
            <TabsContent value="skus">
              <SkuTable product_id={product_id} product_sku={product_sku} currency={currency} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </QueryGuard>
  );
}
