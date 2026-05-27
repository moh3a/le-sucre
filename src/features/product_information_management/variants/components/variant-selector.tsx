"use client";

import { useMemo, useState } from "react";

import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type VariantSelectorProps = {
  product_id: string;
  on_sku_change?: (sku_id: string | null) => void;
};

export function VariantSelector({ product_id, on_sku_change }: VariantSelectorProps) {
  const { data: config, isLoading } = trpc.variants.getConfig.useQuery({ product_id });
  const { data: skus } = trpc.variants.listSkus.useQuery({ product_id });

  const [selected, set_selected] = useState<Record<string, string>>({});

  const matched_sku = useMemo(() => {
    if (!skus?.items.length) return null;
    const selected_ids = Object.values(selected);
    if (!selected_ids.length) return null;
    return (
      skus.items.find((item) => {
        const value_ids = item.options.map((o) => o.value_id).filter(Boolean) as string[];
        return (
          value_ids.length === selected_ids.length &&
          selected_ids.every((id) => value_ids.includes(id))
        );
      }) ?? null
    );
  }, [skus, selected]);

  function pick(property_id: string, value_id: string) {
    const next = { ...selected, [property_id]: value_id };
    set_selected(next);
    // resolve match on next render via effect pattern — simplified:
    const item =
      skus?.items.find((row) => {
        const ids = row.options.map((o) => o.value_id).filter(Boolean) as string[];
        const chosen = Object.values(next);
        return ids.length === chosen.length && chosen.every((id) => ids.includes(id));
      }) ?? null;
    on_sku_change?.(item?.sku_id ?? null);
  }

  if (isLoading) return null;
  if (!config?.properties.length) return null;

  return (
    <div className="space-y-4">
      {config.properties.map((property) => (
        <div key={property.id}>
          <p className="mb-2 text-sm font-medium">{property.name}</p>
          <div className="flex flex-wrap gap-2">
            {property.values.map((value) => {
              const is_selected = selected[property.id] === value.id;
              return (
                <Button
                  key={value.id}
                  type="button"
                  variant={is_selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => pick(property.id, value.id)}
                >
                  {value.label}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      {matched_sku && (
        <Badge variant="secondary">
          {matched_sku.sku_code} · {matched_sku.base_price} {matched_sku.currency}
        </Badge>
      )}
    </div>
  );
}
