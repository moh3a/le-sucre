import { LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import { cn } from "@/lib/utils";

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

function CategoryCard({ category }: { category: CategoryTreeNode }) {
  return (
    <Link href={`/c/${category.slug}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{category.name}</CardTitle>
          {category.description && (
            <CardDescription className="line-clamp-2">
              {category.description}
            </CardDescription>
          )}
        </CardHeader>
        {category.children.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {category.children.slice(0, 6).map((child) => (
                <Badge
                  key={child.id}
                  variant="secondary"
                  className={cn(
                    "bg-muted text-muted-foreground hover:bg-brand-lemon-lime/20 hover:text-brand-olive-leaf",
                    "cursor-pointer text-xs font-normal transition-colors",
                  )}
                >
                  {child.name}
                </Badge>
              ))}
              {category.children.length > 6 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{category.children.length - 6}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">{t("empty_title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("empty_description")}</p>
    </div>
  );
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const tree = await category_service.get_full_tree(true);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("page_title")}</h1>
        <p className="text-muted-foreground">{t("page_description")}</p>
      </div>

      {tree.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </section>
      )}
    </div>
  );
}
