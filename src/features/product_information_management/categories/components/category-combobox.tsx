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
import { CategoryForm } from "./category-form";
import type { CategoryTreeNode } from "../types";

type CategoryOption = {
  id: string;
  label: string;
};

function flatten_categories(nodes: CategoryTreeNode[]): CategoryOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, label: node.name },
    ...flatten_categories(node.children ?? []),
  ]);
}

type CategoryComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  canCreate?: boolean;
};

export function CategoryCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
  canCreate = false,
}: CategoryComboboxProps) {
  const t = useTranslations("categories");
  const [create_open, setCreateOpen] = React.useState(false);

  const { data: tree, isLoading } = trpc.categories.tree.useQuery();

  const category_options = React.useMemo<CategoryOption[]>(
    () => (tree ? flatten_categories(tree) : []),
    [tree],
  );

  const selected_category = React.useMemo(
    () => category_options.find((c) => c.id === value) ?? null,
    [category_options, value],
  );

  function handleCreated(category_id: string) {
    onValueChange(category_id);
    setCreateOpen(false);
  }

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_placeholder")} />}
    >
      <>
        <Combobox
          items={category_options}
          value={selected_category}
          onValueChange={(item) => onValueChange(item?.id ?? null)}
          itemToStringLabel={(item) => item.label}
          disabled={disabled}
        >
          <ComboboxInput placeholder={placeholder ?? t("search_placeholder")} showClear />
          <ComboboxContent>
            <ComboboxList>
              {(item: CategoryOption) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>
              {canCreate ? (
                <div className="flex flex-col items-center gap-2 px-4 py-3">
                  <p className="text-muted-foreground text-sm">{t("no_results")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCreateOpen(true)}
                  >
                    <PlusIcon className="size-3.5" />
                    {t("create_category")}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground px-4 py-3 text-sm">{t("no_results")}</p>
              )}
            </ComboboxEmpty>
          </ComboboxContent>
        </Combobox>

        {canCreate && (
          <ResponsiveDialog open={create_open} onOpenChange={setCreateOpen}>
            <ResponsiveDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <ResponsiveDialogHeader>
                <ResponsiveDialogTitle>{t("new")}</ResponsiveDialogTitle>
                <ResponsiveDialogDescription>{t("new_description")}</ResponsiveDialogDescription>
              </ResponsiveDialogHeader>
              <CategoryForm
                key="category-combobox-create"
                mode="create"
                onCreated={handleCreated}
                onSuccess={() => setCreateOpen(false)}
              />
            </ResponsiveDialogContent>
          </ResponsiveDialog>
        )}
      </>
    </QueryGuard>
  );
}
