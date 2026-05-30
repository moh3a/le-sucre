"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Button } from "@/components/ui/button";
import { ProductStats } from "./product-stats";
import { ProductDataTable } from "./product-data-table";

export function ProductsPageClient() {
  const t = useTranslations("products");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <Button asChild>
          <Link href="/console/products/new">
            <Plus />
            {t("new")}
          </Link>
        </Button>
      }
      stats={<ProductStats />}
    >
      <ProductDataTable />
    </ConsolePageShell>
  );
}
