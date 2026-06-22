"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryForm } from "@/features/product_information_management/categories/components/category-form";

type CategoryFormDialogProps = {
  mode: "create" | "edit";
  category_id?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CategoryFormDialog({
  mode,
  category_id,
  trigger,
  open: open_prop,
  onOpenChange: on_open_change_prop,
}: CategoryFormDialogProps) {
  const t = useTranslations("categories");
  const [open_internal, set_open_internal] = React.useState(false);

  const open = open_prop ?? open_internal;
  const on_open_change = on_open_change_prop ?? set_open_internal;

  const category_query = trpc.categories.byId.useQuery(
    { id: category_id! },
    { enabled: mode === "edit" && !!category_id && open },
  );
  const { data: category, isLoading } = category_query;

  const title = mode === "create" ? t("new") : t("edit");
  const description = mode === "create" ? t("new_description") : t("edit_description");

  function handle_success() {
    on_open_change(false);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={on_open_change}>
      {trigger ? <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger> : null}
      <ResponsiveDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{description}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <QueryGuard query={category_query} loadingFallback={
          <div className="space-y-4 py-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        }>
          <CategoryForm
            key={mode === "edit" ? category_id : "create"}
            mode={mode}
            category_id={category_id}
            default_values={
              mode === "edit" && category
                ? {
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    parent_id: category.parent_id,
                    sort_order: category.sort_order,
                    is_active: category.is_active,
                  }
                : undefined
            }
            onSuccess={handle_success}
          />
        </QueryGuard>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
