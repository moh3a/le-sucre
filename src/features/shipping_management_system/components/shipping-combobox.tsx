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

type ShippingOption = {
  id: string;
  label: string;
};

type ShippingComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ShippingCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: ShippingComboboxProps) {
  const t = useTranslations("shipping");

  const { data, isLoading } = trpc.shipping.adminList.useQuery({
    page: 1,
    limit: 100,
  });

  const shipping_options = React.useMemo<ShippingOption[]>(() => {
    return (
      data?.items.map((s) => {
        const parts: string[] = [`#${s.order_number}`];
        if (s.provider) parts.push(s.provider);
        if (s.recipient_name) parts.push(s.recipient_name);
        if (s.city) parts.push(s.city);
        return { id: s.id, label: parts.join(" — ") };
      }) ?? []
    );
  }, [data]);

  const selected = React.useMemo(
    () => shipping_options.find((s) => s.id === value) ?? null,
    [shipping_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_shipments")} />}
    >
      <Combobox
        items={shipping_options}
        value={selected}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_shipments")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: ShippingOption) => (
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
