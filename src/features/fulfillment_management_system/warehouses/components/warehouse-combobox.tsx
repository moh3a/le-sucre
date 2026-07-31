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

type WarehouseOption = {
  id: string;
  label: string;
};

type WarehouseComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function WarehouseCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: WarehouseComboboxProps) {
  const t = useTranslations("warehouses");

  const { data: warehouses_data, isLoading } = trpc.warehouses.listAllActive.useQuery();

  const warehouse_options = React.useMemo<WarehouseOption[]>(
    () => warehouses_data?.map((w) => ({ id: w.id, label: w.name })) ?? [],
    [warehouses_data],
  );

  const selected_warehouse = React.useMemo(
    () => warehouse_options.find((w) => w.id === value) ?? null,
    [warehouse_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("select_placeholder")} />}
    >
      <Combobox
        items={warehouse_options}
        value={selected_warehouse}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("select_placeholder")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: WarehouseOption) => (
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
