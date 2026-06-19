"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { BrandFormDialog } from "./brand-form-dialog";
import { BrandStats } from "./brand-stats";
import { BrandDataTable } from "./brand-data-table";

export function BrandsPageClient() {
  const t = useTranslations("brands");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <BrandFormDialog
          mode="create"
          trigger={
            <Button>
              <Plus />
              {t("new")}
            </Button>
          }
        />
      </div>
      <BrandStats />
      <BrandDataTable />
    </div>
  );
}
