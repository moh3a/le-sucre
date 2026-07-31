"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import Link from "next/link";

type FlashSaleItem = {
  id: string;
  name: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
};

function FlashSalesSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlashSalesClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const query = trpc.campaigns.flashSalesAdmin.useQuery();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t("flash_sales")}</h1>
      <p className="text-muted-foreground text-sm">{t("flash_sales_subtitle")}</p>

      <QueryGuard query={query} loadingFallback={<FlashSalesSkeleton />}>
        <div className="rounded-lg border">
          <div className="divide-y">
            {query.data?.items?.map((s: FlashSaleItem) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link
                    href={`/console/campaigns/${s.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {s.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {s.starts_at ? new Date(s.starts_at).toLocaleString() : t("no_start")} →{" "}
                    {s.ends_at ? new Date(s.ends_at).toLocaleString() : t("no_end")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(s.status)}`}>
                    {s.status}
                  </span>
                  <Link
                    href={`/console/campaigns/${s.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {tc("edit")}
                  </Link>
                </div>
              </div>
            ))}
            {query.data?.items?.length === 0 && (
              <p className="text-muted-foreground p-4 text-sm">{t("no_flash_sales")}</p>
            )}
          </div>
        </div>
      </QueryGuard>
    </div>
  );
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    scheduled: "bg-blue-100 text-blue-700",
    paused: "bg-yellow-100 text-yellow-700",
    ended: "bg-gray-100 text-gray-500",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
