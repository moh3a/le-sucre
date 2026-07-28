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

type SubcategoryOption = {
  id: string;
  label: string;
};

function flatten_subcategories(
  nodes: CategoryTreeNode[],
  parent_name = "",
): SubcategoryOption[] {
  return nodes.flatMap((node) => {
    const display_name = parent_name ? `${node.name} — ${parent_name}` : node.name;
    return [
      { id: node.id, label: display_name },
      ...flatten_subcategories(node.children ?? [], node.name),
    ];
  });
}

type SubcategoryComboboxProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  canCreate?: boolean;
};

export function SubcategoryCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder,
  canCreate = false,
}: SubcategoryComboboxProps) {
  const t = useTranslations("categories");
  const [create_open, setCreateOpen] = React.useState(false);

  const { data: tree, isLoading } = trpc.categories.tree.useQuery();

  const subcategory_options = React.useMemo<SubcategoryOption[]>(
    () => (tree ? flatten_subcategories(tree) : []),
    [tree],
  );

  const selected_subcategory = React.useMemo(
    () => subcategory_options.find((s) => s.id === value) ?? null,
    [subcategory_options, value],
  );

  function handleCreated(category_id: string) {
    onValueChange(category_id);
    setCreateOpen(false);
  }

  return (
    <QueryGuard
      isLoading={isLoading}
      loadingFallback={<Input disabled placeholder={placeholder ?? t("search_subcategory_placeholder")} />}
    >
      <>
        <Combobox
          items={subcategory_options}
          value={selected_subcategory}
          onValueChange={(item) => onValueChange(item?.id ?? null)}
          itemToStringLabel={(item) => item.label}
          disabled={disabled}
        >
          <ComboboxInput placeholder={placeholder ?? t("search_subcategory_placeholder")} showClear />
          <ComboboxContent>
            <ComboboxList>
              {(item: SubcategoryOption) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>
              {canCreate ? (
                <div className="flex flex-col items-center gap-2 px-4 py-3">
                  <p className="text-muted-foreground text-sm">{t("no_subcategories")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCreateOpen(true)}
                  >
                    <PlusIcon className="size-3.5" />
                    {t("create_subcategory")}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground px-4 py-3 text-sm">{t("no_subcategories")}</p>
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
                key="subcategory-combobox-create"
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
