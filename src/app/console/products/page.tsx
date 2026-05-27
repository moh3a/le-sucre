import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ProductTable } from "@/features/product_information_management/products/components/product-table";
import { Button } from "@/components/ui/button";

export default async function ProductsPage() {
  const t = await getTranslations("products");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/console/products/new">{t("new")}</Link>
        </Button>
      </div>
      <ProductTable />
    </div>
  );
}
