"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { trpc } from "@/components/providers/app-providers";

export function CategoryBreadcrumbs({ category_id }: { category_id: string }) {
  const t = useTranslations("categories");
  const { data } = trpc.categories.ancestors.useQuery({ id: category_id });
  return (
    <nav className="text-muted-foreground text-sm">
      <Link href="/console/categories">{t("breadcrumb_root")}</Link>
      {data?.map((a) => (
        <span key={a.id}>
          {" / "}
          <Link href={`/console/categories/${a.id}/edit`}>{a.name}</Link>
        </span>
      ))}
    </nav>
  );
}
