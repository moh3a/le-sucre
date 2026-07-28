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

type CustomerOption = {
  id: string;
  label: string;
};

type CustomerComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function CustomerCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: CustomerComboboxProps) {
  const t = useTranslations("customers");

  const { data: customers_data, isLoading } = trpc.customers.adminList.useQuery({
    page: 1,
    limit: 100,
  });

  const customer_options = React.useMemo<CustomerOption[]>(() => {
    return (
      customers_data?.items.map((c) => ({
        id: c.user_id,
        label: [c.name, c.email].filter(Boolean).join(" — "),
      })) ?? []
    );
  }, [customers_data]);

  const selected_customer = React.useMemo(
    () => customer_options.find((c) => c.id === value) ?? null,
    [customer_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_placeholder")} />}
    >
      <Combobox
        items={customer_options}
        value={selected_customer}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_placeholder")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: CustomerOption) => (
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
