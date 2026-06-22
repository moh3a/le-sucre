"use client";

import { useMemo, useState } from "react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <QueryGuard isLoading={isLoading} loadingFallback={null}>
    {!config?.properties.length ? null : (
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
                  className={cn(
                    "gap-1.5",
                    value.color_hex && is_selected && "text-white",
                  )}
                  style={
                    value.color_hex && is_selected
                      ? { backgroundColor: value.color_hex, borderColor: value.color_hex }
                      : undefined
                  }
                >
                  {value.color_hex ? (
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 flex-shrink-0 rounded-full border",
                        is_selected && "border-white/50",
                      )}
                      style={{ backgroundColor: value.color_hex }}
                    />
                  ) : value.thumbnail_image ? (
                    <img
                      src={value.thumbnail_image}
                      alt=""
                      className="h-4 w-4 flex-shrink-0 rounded object-cover"
                    />
                  ) : null}
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
    )}
    </QueryGuard>
  );
}
