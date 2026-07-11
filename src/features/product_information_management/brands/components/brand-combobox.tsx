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
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { BrandForm } from "./brand-form";

type BrandComboboxProps = {
  value: string;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function BrandCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: BrandComboboxProps) {
  const t = useTranslations("brands");
  const [create_open, set_create_open] = React.useState(false);

  const { data: brands_data, isLoading } = trpc.brands.active.useQuery();

  const brand_options = React.useMemo(
    () => brands_data?.map((b) => ({ id: b.id, name: b.name })) ?? [],
    [brands_data],
  );

  function handle_created(brand_id: string) {
    onValueChange(brand_id);
    set_create_open(false);
  }

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input value={value} disabled placeholder={placeholder ?? t("searchBrands")} />}
    >
      <>
        <Combobox
          value={value}
          onValueChange={(val) => onValueChange(val || null)}
          disabled={disabled}
        >
          <ComboboxInput placeholder={placeholder ?? t("searchBrands")} showClear />
          <ComboboxContent>
            <ComboboxList>
              {brand_options.map((brand) => (
                <ComboboxItem key={brand.id} value={brand.id}>
                  {brand.name}
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>
              <div className="flex flex-col items-center gap-2 px-4 py-3">
                <p className="text-muted-foreground text-sm">{t("no_results")}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => set_create_open(true)}
                >
                  <PlusIcon className="size-3.5" />
                  {t("create_brand")}
                </Button>
              </div>
            </ComboboxEmpty>
          </ComboboxContent>
        </Combobox>

        <ResponsiveDialog open={create_open} onOpenChange={set_create_open}>
          <ResponsiveDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>{t("new")}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {t("create_brand_desc")}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <BrandForm
              key="brand-combobox-create"
              mode="create"
              onCreated={handle_created}
              onSuccess={() => set_create_open(false)}
            />
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </>
    </QueryGuard>
  );
}
