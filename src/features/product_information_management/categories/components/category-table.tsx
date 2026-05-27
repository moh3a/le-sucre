"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";

export function CategoryTable() {
  const t = useTranslations("categories");
  const { data, isLoading } = trpc.categories.list.useQuery({ page: 1, limit: 100 });

  if (isLoading) return <p className="text-muted-foreground text-sm">…</p>;
  if (!data?.items.length) return <p className="text-muted-foreground text-sm">{t("empty")}</p>;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3">{t("name")}</th>
            <th className="px-4 py-3">{t("slug")}</th>
            <th className="px-4 py-3">{t("active")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {data.items.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="text-muted-foreground px-4 py-3">{c.slug}</td>
              <td className="px-4 py-3">{c.is_active ? "✓" : "—"}</td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/console/categories/${c.id}/edit`}>Edit</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
