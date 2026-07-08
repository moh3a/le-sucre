"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Package } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { ORDER_STATUS, ORDER_LABELS, STATUS_BADGE } from "../constants/order-status";
import { OrdersPageSkeleton } from "./orders-page-skeleton";

const FILTERS = [
  { value: "", label: "Toutes" },
  ...Object.entries(ORDER_STATUS).map(([key, value]) => ({
    value,
    label: ORDER_LABELS[value] ?? value,
  })),
];

export function CustomerOrdersPageClient() {
  const tLayout = useTranslations("layout");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const query = trpc.orders.myOrders.useQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  function handleFilterChange(status: string) {
    setStatusFilter(status);
    setPage(1);
  }

  return (
    <QueryGuard
      query={{ isLoading: query.isLoading, error: query.error }}
      loadingFallback={<OrdersPageSkeleton />}
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <h1 className="text-2xl font-bold">{tLayout("my_orders")}</h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {query.data?.items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Aucune commande trouvée</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => router.push("/boutique")}
              >
                Commencer mes achats
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-4">
            {query.data?.items.map((order) => {
              const shipping = order.shipping_address as Record<string, unknown> | null;
              const shippingCity = shipping && typeof shipping.city === "string" ? shipping.city : null;
              return (
                <Card
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.placed_at
                            ? new Date(order.placed_at).toLocaleDateString()
                            : new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={STATUS_BADGE[order.status] ?? "secondary"}>
                        {ORDER_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex size-12 items-center justify-center rounded-md">
                          <Package className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Commande {order.order_number}
                          </p>
                          {shippingCity && (
                            <p className="text-muted-foreground text-xs">
                              Livraison vers {shippingCity}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {Number(order.grand_total).toLocaleString()} {order.currency}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {query.data?.meta && query.data.meta.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            {Array.from({ length: query.data.meta.total_pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === query.data.meta.total_pages ||
                  Math.abs(p - page) <= 2,
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  <Button
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="size-9"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (query.data?.meta.total_pages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </QueryGuard>
  );
}
