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
import { BrandForm } from "./brand-form";

type BrandFormDialogProps = {
  mode: "create" | "edit";
  brand_id?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BrandFormDialog({
  mode,
  brand_id,
  trigger,
  open: open_prop,
  onOpenChange: on_open_change_prop,
}: BrandFormDialogProps) {
  const t = useTranslations("brands");
  const [open_internal, set_open_internal] = React.useState(false);

  const open = open_prop ?? open_internal;
  const on_open_change = on_open_change_prop ?? set_open_internal;

  const brand_query = trpc.brands.byId.useQuery(
    { id: brand_id! },
    { enabled: mode === "edit" && !!brand_id && open },
  );
  const { data: brand } = brand_query;

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

        <QueryGuard
          query={brand_query}
          loadingFallback={
            <div className="space-y-4 py-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          }
        >
          <BrandForm
            key={mode === "edit" ? brand_id : "create"}
            mode={mode}
            brand_id={brand_id}
            default_values={
              mode === "edit" && brand
                ? {
                    name: brand.name,
                    slug: brand.slug,
                    description: brand.description,
                    website_url: brand.website_url,
                    logo_url: brand.logo_url,
                    is_active: brand.is_active,
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
