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
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Liste</TabsTrigger>
          <TabsTrigger value="password">{t("tree_title")}</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <h3>Liste des catégories</h3>
          <CategoryTable />
        </TabsContent>
        <TabsContent value="password">
          <h3>{t("tree_title")}</h3>
          <CategoryTree />
        </TabsContent>
      </Tabs>
    </div>
  );
}
