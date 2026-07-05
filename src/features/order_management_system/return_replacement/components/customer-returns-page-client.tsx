"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Package, RotateCcw, ArrowLeftRight, PackageX } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReturnsPageSkeleton } from "./returns-page-skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";
import { RETURN_REQUEST_TYPE_LABELS, RETURN_REQUEST_STATUS_LABELS, RETURN_REQUEST_STATUS_BADGE } from "../constants/status";

function getTypeIcon(type: string) {
  switch (type) {
    case "return":
      return <RotateCcw className="size-4" />;
    case "replacement":
      return <ArrowLeftRight className="size-4" />;
    case "failed_delivery":
      return <PackageX className="size-4" />;
    default:
      return <RotateCcw className="size-4" />;
  }
}

export function CustomerReturnsPageClient() {
  const t = useTranslations("returns");
  const query = trpc.returns.myReturns.useQuery();

  return (
    <QueryGuard
      query={{ isLoading: query.isLoading, error: query.error }}
      loadingFallback={<ReturnsPageSkeleton />}
    >
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <h1 className="text-2xl font-bold">{t("my_returns")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>

        {!query.data?.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("no_returns")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {query.data.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md mt-0.5">
                        {getTypeIcon(r.type)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium">
                          {t("return_number", { id: r.id.slice(0, 8) })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("order", { id: r.order_id.slice(0, 12) })}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{RETURN_REQUEST_TYPE_LABELS[r.type] ?? r.type}</span>
                          <span>·</span>
                          <span>{r.items?.length ?? 0} article{(r.items?.length ?? 0) > 1 ? "s" : ""}</span>
                        </div>
                        {r.reason && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {r.reason}
                          </p>
                        )}
                        {r.created_at && (
                          <p className="text-xs text-muted-foreground/60">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={RETURN_REQUEST_STATUS_BADGE[r.status] ?? "outline"} className="shrink-0">
                      {RETURN_REQUEST_STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t.rich("create_return_text", {
            link: (chunks) => (
              <Link href="/account/orders" className="text-primary hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </QueryGuard>
  );
}
