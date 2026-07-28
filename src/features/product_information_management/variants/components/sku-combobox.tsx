"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type SkuOption = {
  id: string;
  label: string;
};

type SkuComboboxProps = {
  product_id: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  canCreate?: boolean;
};

export function SkuCombobox({
  product_id,
  value,
  onValueChange,
  disabled = false,
  placeholder,
  canCreate = false,
}: SkuComboboxProps) {
  const t = useTranslations("variants");

  const { data: sku_data, isLoading } = trpc.variants.listSkus.useQuery(
    { product_id },
    { enabled: !!product_id },
  );

  const sku_options = React.useMemo<SkuOption[]>(() => {
    const items = sku_data?.items ?? [];
    return items.map((sku) => ({
      id: sku.sku_id,
      label:
        sku.options.length > 0
          ? `${sku.sku_code} — ${sku.options.map((o) => o.value_label ?? o.value_code).join(" / ")}`
          : sku.sku_code,
    }));
  }, [sku_data]);

  const selected_sku = React.useMemo(
    () => sku_options.find((s) => s.id === value) ?? null,
    [sku_options, value],
  );

  if (!product_id) {
    return (
      <Input disabled placeholder={placeholder ?? t("select_product_first")} />
    );
  }

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("loading")} />}
    >
      <Combobox
        items={sku_options}
        value={selected_sku}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_placeholder")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: SkuOption) => (
              <ComboboxItem key={item.id} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>
            <p className="text-muted-foreground px-4 py-3 text-sm">{t("no_results")}</p>
          </ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </QueryGuard>
  );
}
