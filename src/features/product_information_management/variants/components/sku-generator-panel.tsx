"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { GenerateSkusResult } from "../types";

type SkuGeneratorPanelProps = {
  product_id: string;
  on_change?: () => void;
};

export function SkuGeneratorPanel({ product_id, on_change }: SkuGeneratorPanelProps) {
  const t = useTranslations("variants");
  const utils = trpc.useUtils();
  const [max_combinations, set_max_combinations] = useState(500);
  const [last_result, set_last_result] = useState<GenerateSkusResult | null>(null);

  const generate = trpc.variants.generateSkus.useMutation({
    onSuccess: async (result) => {
      set_last_result(result);
      await utils.variants.listSkus.invalidate({ product_id });
      await utils.variants.getPriceRange.invalidate({ product_id });
      on_change?.();
    },
  });

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-heading mb-4 text-sm font-semibold">{t("section_generate")}</h3>
      <div className="flex flex-wrap items-end gap-4">
        <Field className="w-40">
          <FieldLabel>{t("max_combinations")}</FieldLabel>
          <Input
            type="number"
            min={1}
            max={5000}
            value={max_combinations}
            onChange={(e) => set_max_combinations(Number(e.target.value))}
          />
        </Field>
        <Button
          type="button"
          onClick={() =>
            generate.mutate({
              product_id,
              max_combinations,
            })
          }
          disabled={generate.isPending}
        >
          {t("generate_skus")}
        </Button>
      </div>

      {last_result && (
        <p className="text-muted-foreground mt-3 text-sm">
          {t("generate_result", {
            created: last_result.created,
            skipped: last_result.skipped,
            attempted: last_result.attempted,
          })}
          {last_result.capped && (
            <span className="text-destructive ml-2">{t("generate_capped")}</span>
          )}
        </p>
      )}
    </div>
  );
}
