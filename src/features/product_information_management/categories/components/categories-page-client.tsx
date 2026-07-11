"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/features/product_information_management/categories/components/category-form-dialog";
import { CategoryStats } from "@/features/product_information_management/categories/components/category-stats";
import { CategoryTable } from "@/features/product_information_management/categories/components/category-table";
import { CategoryTree } from "@/features/product_information_management/categories/components/category-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CategoriesPageClient() {
  const t = useTranslations("categories");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <CategoryFormDialog
          mode="create"
          trigger={
            <Button>
              <Plus />
              {t("new")}
            </Button>
          }
        />
      </div>
      <CategoryStats />
      <Tabs defaultValue="list">
        <TabsList className="mb-6">
          <TabsTrigger value="list">{t("tab_list")}</TabsTrigger>
          <TabsTrigger value="tree">{t("tree_title")}</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <h3>{t("tab_list")}</h3>
          <CategoryTable />
        </TabsContent>
        <TabsContent value="tree">
          <h3>{t("tree_title")}</h3>
          <CategoryTree />
        </TabsContent>
      </Tabs>
    </div>
  );
}
