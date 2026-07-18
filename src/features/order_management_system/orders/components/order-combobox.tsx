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

type OrderItem = {
  id: string;
  label: string;
};

type OrderComboboxProps = {
  value: string;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function OrderCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: OrderComboboxProps) {
  const t = useTranslations("orders");

  const { data, isLoading } = trpc.orders.adminListEnriched.useQuery({
    page: 1,
    limit: 100,
  });

  const order_options = React.useMemo(
    () =>
      data?.items.map((o) => ({
        id: o.id,
        label: `#${o.order_number}${o.customer_name ? ` — ${o.customer_name}` : ""}`,
      })) ?? [],
    [data],
  );

  const selected_order = React.useMemo(
    () => order_options.find((o) => o.id === value) ?? null,
    [order_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input value={value} disabled placeholder={placeholder ?? t("search_orders")} />}
    >
      <Combobox
        items={order_options}
        value={selected_order}
        onValueChange={(val) => onValueChange(val?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_orders")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(order: OrderItem) => (
              <ComboboxItem key={order.id} value={order}>
                {order.label}
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
