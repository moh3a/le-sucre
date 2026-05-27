"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { VariantPropertyEditor } from "./variant-property-editor";
import { SkuGeneratorPanel } from "./sku-generator-panel";
import { SkuTable } from "./sku-table";

type ProductVariantsPanelProps = {
  product_id: string;
  product_sku: string;
  currency: string;
};

export function ProductVariantsPanel({
  product_id,
  product_sku,
  currency,
}: ProductVariantsPanelProps) {
  const t = useTranslations("variants");
  const utils = trpc.useUtils();
  const [refresh_key, set_refresh_key] = useState(0);

  const { data: price_range } = trpc.variants.getPriceRange.useQuery({ product_id });

  const enable_variants = trpc.variants.enableVariants.useMutation({
    onSuccess: () => utils.variants.getConfig.invalidate({ product_id }),
  });

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
    <div className="space-y-8" key={refresh_key}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => enable_variants.mutate({ product_id })}
          disabled={enable_variants.isPending}
        >
          {t("enable_variants")}
        </Button>
      </div>

      <section>
        <h3 className="font-heading mb-3 text-sm font-semibold">{t("section_properties")}</h3>
        <VariantPropertyEditor product_id={product_id} on_change={bump} />
      </section>

      <SkuGeneratorPanel product_id={product_id} on_change={bump} />

      <section>
        <h3 className="font-heading mb-3 text-sm font-semibold">{t("section_skus")}</h3>
        <SkuTable
          product_id={product_id}
          product_sku={product_sku}
          currency={currency}
          on_change={bump}
        />
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="font-heading mb-3 text-sm font-semibold">{t("wholesale_title")}</h3>
        <FieldGroup className="grid gap-4 md:grid-cols-4">
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
              onChange={(e) => set_wholesale((w) => ({ ...w, discount_percent: e.target.value }))}
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
      </section>
    </div>
  );
}
