"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type UserOption = {
  id: string;
  label: string;
};

type UserComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  allowedRoles?: string[];
};

export function UserCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
  allowedRoles,
}: UserComboboxProps) {
  const t = useTranslations("users");

  const { data: users_data, isLoading } = trpc.adminAuth.listUsers.useQuery({
    page: 1,
    limit: 100,
  });

  const user_options = React.useMemo<UserOption[]>(() => {
    return (
      users_data?.items
        .filter((u) => {
          if (!allowedRoles || allowedRoles.length === 0) return true;
          const user_roles = (u.roles ?? "").split(", ").filter(Boolean);
          return user_roles.some((r) => allowedRoles.includes(r));
        })
        .map((u) => ({
          id: u.id,
          label: [u.name, u.role !== "—" ? u.role : null].filter(Boolean).join(" — "),
        })) ?? []
    );
  }, [users_data, allowedRoles]);

  const selected_user = React.useMemo(
    () => user_options.find((u) => u.id === value) ?? null,
    [user_options, value],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      // loadingFallback={<Input disabled placeholder={placeholder ?? t("search_placeholder")} />}
    >
      <Combobox
        items={user_options}
        value={selected_user}
        onValueChange={(item) => onValueChange(item?.id ?? null)}
        itemToStringLabel={(item) => item.label}
        disabled={disabled}
      >
        <ComboboxInput placeholder={placeholder ?? t("search_placeholder")} showClear />
        <ComboboxContent>
          <ComboboxList>
            {(item: UserOption) => (
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
