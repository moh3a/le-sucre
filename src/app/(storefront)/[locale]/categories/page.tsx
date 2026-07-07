import { LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { CategoryCard } from "@/features/product_information_management/categories/components/storefront/category-card";
import { DataState } from "@/components/storefront/data-state";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const tree = await category_service.get_full_tree(true);

  return (
    <div className="mx-auto container space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("page_title")}</h1>
        <p className="text-muted-foreground">{t("page_description")}</p>
      </div>

      <DataState
        isEmpty={tree.length === 0}
        emptyIcon={<LayoutGrid className="text-muted-foreground/40 h-8 w-8" />}
        emptyTitle={t("empty_title")}
        emptyDescription={t("empty_description")}
      >
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((category) => (
            <CategoryCard
              key={category.id}
              category={{
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image_url: null,
                children: category.children.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  description: c.description ?? null,
                  image_url: null,
                  children: [],
                })),
              }}
            />
          ))}
        </section>
      </DataState>
    </div>
  );
}
