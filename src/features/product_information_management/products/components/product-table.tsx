"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/20 text-primary-foreground",
  archived: "bg-destructive/15 text-destructive",
};

export function ProductTable() {
  const t = useTranslations("products");
  const query = trpc.products.list.useQuery({ page: 1, limit: 50 });
  const { data, isLoading } = query;

  if (!data?.items.length) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <QueryGuard query={query} loadingFallback={<p className="text-sm text-muted-foreground">{t("loading")}</p>}>
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3">{t("name")}</th>
            <th className="px-4 py-3">{t("sku")}</th>
            <th className="px-4 py-3">{t("status")}</th>
            <th className="px-4 py-3">{t("base_price")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3 font-medium">{item.name ?? item.slug}</td>
              <td className="px-4 py-3 text-muted-foreground">{item.sku}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[item.status] ?? ""}`}
                >
                  {t(`status_${item.status}` as "status_draft")}
                </span>
              </td>
              <td className="px-4 py-3">{item.base_price}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/console/products/${item.id}`}>{t("view")}</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </QueryGuard>
  );
}
