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

type CampaignOption = {
  id: string;
  label: string;
};

type CampaignComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function CampaignCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: CampaignComboboxProps) {
  const t = useTranslations("campaigns");

  const { data, isLoading } = trpc.campaigns.adminList.useQuery({
    page: 1,
    limit: 100,
  });

  const campaign_options = React.useMemo<CampaignOption[]>(() => {
    return (
      data?.items.map((c) => {
        const parts: string[] = [c.name];
        if (c.campaign_type) parts.push(c.campaign_type);
        if (c.status) parts.push(c.status);
        return { id: c.id, label: parts.join(" — ") };
      }) ?? []
    );
  }, [data]);

  const selected = React.useMemo(
    () => campaign_options.find((c) => c.id === value) ?? null,
    [campaign_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_campaigns")} />}
    >
      <Combobox
        items={campaign_options}
        value={selected}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_campaigns")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: CampaignOption) => (
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
