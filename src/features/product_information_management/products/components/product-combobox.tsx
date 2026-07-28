"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";

type ProductOption = {
  id: string;
  label: string;
};

function flatten_categories(
  nodes: CategoryTreeNode[],
  map: Map<string, string>,
): Map<string, string> {
  for (const node of nodes) {
    map.set(node.id, node.name);
    if (node.children?.length) flatten_categories(node.children, map);
  }
  return map;
}

type ProductComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  canCreate?: boolean;
};

export function ProductCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
  canCreate = false,
}: ProductComboboxProps) {
  const t = useTranslations("inventory");

  const { data: products_data, isLoading } = trpc.products.list.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: category_tree } = trpc.categories.tree.useQuery();
  const { data: brands_data } = trpc.brands.active.useQuery();

  const category_map = React.useMemo(() => {
    if (!category_tree) return new Map<string, string>();
    return flatten_categories(category_tree, new Map());
  }, [category_tree]);

  const brand_map = React.useMemo(() => {
    if (!brands_data) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const b of brands_data) {
      map.set(b.id, b.name);
    }
    return map;
  }, [brands_data]);

  const product_options = React.useMemo<ProductOption[]>(() => {
    const items = products_data?.items ?? [];
    return items.map((p) => {
      const parts: string[] = [p.name ?? p.sku];
      const category_name = p.category_id ? category_map.get(p.category_id) : undefined;
      const brand_name = p.brand_id ? brand_map.get(p.brand_id) : undefined;
      if (category_name) parts.push(category_name);
      if (brand_name) parts.push(brand_name);
      return { id: p.id, label: parts.join(" — ") };
    });
  }, [products_data, category_map, brand_map]);

  const selected_product = React.useMemo(
    () => product_options.find((p) => p.id === value) ?? null,
    [product_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_product_placeholder")} />}
    >
      <Combobox
        items={product_options}
        value={selected_product}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput
          placeholder={placeholder ?? t("search_product_placeholder")}
          showClear
        />
        <ComboboxContent>
          <ComboboxList>
            {(item: ProductOption) => (
              <ComboboxItem key={item.id} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>
            <p className="text-muted-foreground px-4 py-3 text-sm">
              {t("no_results")}
            </p>
          </ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </QueryGuard>
  );
}
