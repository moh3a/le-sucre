"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { VariantPropertyEditor } from "./variant-property-editor";
import { SkuTable } from "./sku-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  const utils = trpc.useUtils();
  const [refresh_key, set_refresh_key] = useState(0);

  const { data: price_range } = trpc.variants.getPriceRange.useQuery({ product_id });

  const upsert_wholesale = trpc.variants.upsertWholesaleRule.useMutation({
    onSuccess: () => utils.variants.getPriceRange.invalidate({ product_id }),
  });

  const [wholesale, set_wholesale] = useState({
    min_quantity: 10,
    price: "",
    discount_percent: "",
  });

  const bump = () => set_refresh_key((k) => k + 1);

  return (
    <Card key={refresh_key}>
      <CardHeader className="flex flex-row flex-wrap justify-between gap-4">
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
          {price_range?.min_price != null && price_range?.max_price != null && (
            <p className="mt-2 text-sm">
              {t("price_range_value", {
                min: price_range.min_price,
                max: price_range.max_price,
                currency: price_range.currency ?? currency,
              })}
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
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">{t("section_properties")}</TabsTrigger>
            <TabsTrigger value="skus">{t("section_skus")}</TabsTrigger>
            <TabsTrigger value="wholesale">Gros</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
            <VariantPropertyEditor product_id={product_id} on_change={bump} />
          </TabsContent>
          <TabsContent value="skus">
            <SkuTable
              product_id={product_id}
              product_sku={product_sku}
              currency={currency}
              on_change={bump}
            />
          </TabsContent>
          <TabsContent value="wholesale">
            <div className="font-heading pb-6 text-2xl font-semibold">{t("wholesale_title")}</div>
            <FieldGroup>
              <Field>
                <FieldLabel>{t("wholesale_min_qty")}</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={wholesale.min_quantity}
                  onChange={(e) =>
                    set_wholesale((w) => ({ ...w, min_quantity: Number(e.target.value) }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>{t("wholesale_price")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={wholesale.price}
                  onChange={(e) => set_wholesale((w) => ({ ...w, price: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel>{t("wholesale_discount")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={wholesale.discount_percent}
                  onChange={(e) =>
                    set_wholesale((w) => ({ ...w, discount_percent: e.target.value }))
                  }
                />
              </Field>
              <Field className="flex items-end">
                <Button
                  type="button"
                  onClick={() =>
                    upsert_wholesale.mutate({
                      product_id,
                      sku_id: null,
                      min_quantity: wholesale.min_quantity,
                      currency,
                      price: wholesale.price ? Number(wholesale.price) : null,
                      discount_percent: wholesale.discount_percent
                        ? Number(wholesale.discount_percent)
                        : null,
                      is_active: true,
                    })
                  }
                  disabled={upsert_wholesale.isPending}
                >
                  {t("add_wholesale_rule")}
                </Button>
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
