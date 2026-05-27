import { getTranslations } from "next-intl/server";

import { CategoryForm } from "@/features/product_information_management/categories/components/category-form";

export default async function NewCategoryPage() {
  const t = await getTranslations("categories");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
