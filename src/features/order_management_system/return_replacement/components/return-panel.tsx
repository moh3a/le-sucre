"use client";

import { QueryGuard } from "@/components/query-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { CreateRequestDialog } from "./create-request-dialog";
import { RequestCard } from "./request-card";
import type { ReturnRequestRow } from "./types";

type ReturnPanelProps = {
  order_id: string;
  items: Array<{
    id: string;
    sku_id: string;
    product_name: string;
    sku_code: string;
    quantity: number;
    unit_price: string;
  }>;
  order_status: string;
  on_update: () => void;
};

export function ReturnPanel({ order_id, items, order_status, on_update }: ReturnPanelProps) {
  const {
    data: raw_requests,
    isLoading,
    refetch,
  } = trpc.returns.adminListByOrder.useQuery({ order_id });

  const requests = raw_requests as ReturnRequestRow[] | undefined;

  const can_request_return =
    order_status === "delivered" && (!requests || requests.every((r) => r.status !== "pending"));

  const can_request_failed =
    (order_status === "shipped" || order_status === "delivered") &&
    (!requests || requests.every((r) => r.status !== "pending"));

  return (
    <QueryGuard query={{ isLoading }}>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Retours & remplacements</CardTitle>
        <div className="flex gap-2">
          {can_request_failed && (
            <CreateRequestDialog
              order_id={order_id}
              items={items}
              type="failed_delivery"
              on_created={() => {
                refetch();
                on_update();
              }}
            />
          )}
          {can_request_return && (
            <CreateRequestDialog
              order_id={order_id}
              items={items}
              type="return"
              on_created={() => {
                refetch();
                on_update();
              }}
            />
          )}
          {can_request_return && (
            <CreateRequestDialog
              order_id={order_id}
              items={items}
              type="replacement"
              on_created={() => {
                refetch();
                on_update();
              }}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-muted-foreground text-sm">Chargement des demandes…</p>}

        {requests && requests.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Aucune demande de retour ou de remplacement pour cette commande.
          </p>
        )}

        {requests?.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            on_update={() => {
              refetch();
              on_update();
            }}
          />
        ))}
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
