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
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { SupplierDialogContent } from "./procurement-client";

type SupplierOption = {
  id: string;
  label: string;
};

type SupplierComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  canCreate?: boolean;
};

export function SupplierCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
  canCreate = false,
}: SupplierComboboxProps) {
  const t = useTranslations("procurement");
  const [create_open, setCreateOpen] = React.useState(false);

  const { data: suppliers_data, isLoading } =
    trpc.operationsWorkflows.suppliersList.useQuery();

  const supplier_options = React.useMemo<SupplierOption[]>(
    () =>
      (suppliers_data as Array<{ id: string; name: string }> | undefined)?.map((s) => ({
        id: s.id,
        label: s.name,
      })) ?? [],
    [suppliers_data],
  );

  const selected_supplier = React.useMemo(
    () => supplier_options.find((s) => s.id === value) ?? null,
    [supplier_options, value],
  );

  function handleCreated() {
    setCreateOpen(false);
  }

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={
        <Input disabled placeholder={placeholder ?? t("supplier_required")} />
      }
    >
      <>
        <Combobox
          items={supplier_options}
          value={selected_supplier}
          onValueChange={(item) => onValueChange(item?.id ?? null)}
          itemToStringLabel={(item) => item.label}
          disabled={disabled}
        >
          <ComboboxInput
            placeholder={placeholder ?? t("supplier_required")}
            showClear
          />
          <ComboboxContent>
            <ComboboxList>
              {(item: SupplierOption) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>
              {canCreate ? (
                <div className="flex flex-col items-center gap-2 px-4 py-3">
                  <p className="text-muted-foreground text-sm">
                    {t("no_results")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCreateOpen(true)}
                  >
                    <PlusIcon className="size-3.5" />
                    {t("create_supplier_button")}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground px-4 py-3 text-sm">
                  {t("no_results")}
                </p>
              )}
            </ComboboxEmpty>
          </ComboboxContent>
        </Combobox>

        {canCreate && (
          <ResponsiveDialog
            open={create_open}
            onOpenChange={setCreateOpen}
          >
            <ResponsiveDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <ResponsiveDialogHeader>
                <ResponsiveDialogTitle>
                  {t("create_supplier_title")}
                </ResponsiveDialogTitle>
                <ResponsiveDialogDescription>
                  {t("create_supplier_button")}
                </ResponsiveDialogDescription>
              </ResponsiveDialogHeader>
              <SupplierDialogContent onOpenChange={handleCreated} />
            </ResponsiveDialogContent>
          </ResponsiveDialog>
        )}
      </>
    </QueryGuard>
  );
}
