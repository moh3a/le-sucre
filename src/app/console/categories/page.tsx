import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { CategoryTree } from "@/features/product_information_management/categories/components/category-tree";
import { CategoryTable } from "@/features/product_information_management/categories/components/category-table";

export default async function CategoriesPage() {
  const t = await getTranslations("categories");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/console/categories/new">{t("new")}</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <CategoryTree />
        <CategoryTable />
      </div>
    </div>
  );
}
