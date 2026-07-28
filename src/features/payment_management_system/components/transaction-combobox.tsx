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

type TransactionOption = {
  id: string;
  label: string;
};

type TransactionComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function TransactionCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: TransactionComboboxProps) {
  const t = useTranslations("payments");

  const { data, isLoading } = trpc.payments.adminList.useQuery({
    page: 1,
    limit: 100,
  });

  const transaction_options = React.useMemo<TransactionOption[]>(() => {
    return (
      data?.items.map((tx) => {
        const parts: string[] = [];
        if (tx.order_number) parts.push(`#${tx.order_number}`);
        parts.push(`${Number(tx.amount).toLocaleString("fr-DZ", { style: "currency", currency: tx.currency })}`);
        parts.push(tx.status);
        return { id: tx.id, label: parts.join(" — ") };
      }) ?? []
    );
  }, [data]);

  const selected_transaction = React.useMemo(
    () => transaction_options.find((tx) => tx.id === value) ?? null,
    [transaction_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_transaction_placeholder")} />}
    >
      <Combobox
        items={transaction_options}
        value={selected_transaction}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_transaction_placeholder")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: TransactionOption) => (
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
